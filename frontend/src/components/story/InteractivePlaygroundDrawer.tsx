'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { X, Play, Loader2, Sparkles, Terminal } from 'lucide-react';
import { api } from '@/lib/api';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface PlaygroundProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractivePlaygroundDrawer: React.FC<PlaygroundProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'python' | 'c' | 'java'>('python');
  const [code, setCode] = useState<string>('print("Hello from Code-a-thon 2026!")');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [running, setRunning] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRun = async () => {
    setRunning(true);
    setOutput('Compiling in isolated sandbox runner...');
    try {
      const res = await api.submissions.runPlayground({
        language: lang,
        sourceCode: code,
        customInput: input
      });
      setOutput(res.results?.[0]?.actualOutput || res.compileOutput || 'Done');
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white h-full brutal-border shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="bg-[#171717] text-white p-4 flex items-center justify-between border-b-2 border-[#171717]">
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <Terminal className="w-4 h-4 text-[#B8E63E]" />
            <span>Interactive Code Playground</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-[#F7F4ED] border-b-2 border-[#171717] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['c', 'python', 'java'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase transition-all ${
                  lang === l
                    ? 'bg-[#3155FF] text-white brutal-border'
                    : 'bg-white text-gray-700 hover:bg-gray-100 brutal-border'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <button
            onClick={handleRun}
            disabled={running}
            className="px-4 py-1.5 bg-[#B8E63E] text-[#171717] text-xs font-mono font-black uppercase rounded brutal-border brutal-shadow-sm flex items-center gap-1.5"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Run Sandbox
          </button>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 bg-[#1e1e1e]">
          <Editor
            height="100%"
            language={lang === 'c' ? 'c' : lang === 'python' ? 'python' : 'java'}
            value={code}
            onChange={(v) => setCode(v || '')}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
          />
        </div>

        {/* Console Drawer */}
        <div className="h-44 bg-[#171717] border-t-2 border-[#171717] p-3 text-white flex flex-col">
          <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
            Standard Output:
          </div>
          <div className="flex-1 bg-[#242424] p-2 font-mono text-xs text-[#B8E63E] rounded overflow-y-auto whitespace-pre-wrap">
            {output || 'Click "Run Sandbox" to execute code against the isolated runner.'}
          </div>
        </div>
      </div>
    </div>
  );
};
