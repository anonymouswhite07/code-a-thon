'use client';

import React, { useState } from 'react';
import { Play, Terminal, ArrowDown } from 'lucide-react';
import { CodeMascot } from '@/components/mascot/CodeMascot';
import { API_BASE } from '@/lib/api';

const STARTER_CODES: Record<string, string> = {
  c: `#include <stdio.h>

int main() {
    int scores[] = {85, 92, 78, 96, 88};
    int max = scores[0];
    for (int i = 1; i < 5; i++) {
        if (scores[i] > max) max = scores[i];
    }
    printf("Top score in C Foundation: %d\\n", max);
    return 0;
}`,
  python: `def solve():
    scores = [85, 92, 78, 96, 88]
    best = max(scores)
    print(f"Top score in Python Logic: {best}")

if __name__ == "__main__":
    solve()`,
  java: `public class Main {
    public static void main(String[] args) {
        int[] scores = {85, 92, 78, 96, 88};
        int max = scores[0];
        for (int s : scores) {
            if (s > max) max = s;
        }
        System.out.println("Top score in Java Mastery: " + max);
    }
}`
};

export const ChapterCode: React.FC = () => {
  const [lang, setLang] = useState<'c' | 'python' | 'java'>('c');
  const [code, setCode] = useState<string>(STARTER_CODES.c);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mascotStatus, setMascotStatus] = useState<'idle' | 'typing' | 'success' | 'failure'>('idle');

  const handleLangChange = (newLang: 'c' | 'python' | 'java') => {
    setLang(newLang);
    setCode(STARTER_CODES[newLang]);
    setOutput(null);
    setError(null);
    setMascotStatus('idle');
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setError(null);
    setMascotStatus('typing');

    try {
      const res = await fetch(`${API_BASE}/submissions/playground/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang,
          sourceCode: code,
          customInput: ''
        })
      });

      if (!res.ok) {
        throw new Error(`Compiler server returned ${res.status}`);
      }

      const data = await res.json();
      const payload = data.data || data;

      if (payload.exitCode === 0) {
        setOutput(payload.stdout || 'Program executed with no standard output.');
        setMascotStatus('success');
      } else {
        setError(payload.stderr || payload.error || 'Execution returned non-zero exit code.');
        setMascotStatus('failure');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Execution failed. Is the backend and code-runner running?';
      setError(errMsg);
      setMascotStatus('failure');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section id="code" className="min-h-screen py-24 px-4 flex flex-col justify-center border-t-2 border-[#171717]/10 bg-[#F7F4ED]">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        {/* Chapter Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#B8E63E] text-[#171717] font-mono text-xs font-black uppercase rounded-md brutal-border brutal-shadow-sm">
              Chapter 03 — Code
            </span>
            <span className="text-xs font-mono font-bold text-gray-400">PRACTICE SANDBOX</span>
          </div>

          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-[#171717] tracking-tight font-display">
            TRY BEFORE <br />
            <span className="text-[#3155FF]">YOU COMPETE.</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-700 font-medium max-w-2xl">
            Test the live sandbox right now. Switch between C, Python, and Java. Real execution, real time limits, zero installation.
          </p>
        </div>

        {/* Live Playground Block */}
        <div className="bg-[#171717] rounded-3xl brutal-border brutal-shadow-xl overflow-hidden text-white flex flex-col">
          {/* Top Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-[#202020]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-gray-400 mr-2">Language:</span>
              {(['c', 'python', 'java'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLangChange(l)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-black uppercase transition cursor-pointer ${
                    lang === l
                      ? 'bg-[#3155FF] text-white brutal-border brutal-shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }`}
                >
                  {l === 'c' ? 'C Foundation' : l === 'python' ? 'Python 3' : 'Java 17'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="px-6 py-2 bg-[#B8E63E] hover:bg-[#a3d42c] text-[#171717] font-black text-xs uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" /> Run Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor & Output split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[340px]">
            {/* Left Code Editor Area */}
            <div className="lg:col-span-7 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col font-mono text-xs sm:text-sm">
              <div className="flex items-center justify-between text-gray-500 pb-2 text-[11px]">
                <span>EDIT CODE // {lang.toUpperCase()}</span>
                <span>CTRL+ENTER to Run</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                className="w-full flex-1 bg-transparent text-gray-200 focus:outline-none resize-none font-mono text-xs sm:text-sm leading-relaxed p-2 rounded-lg bg-black/20"
                spellCheck={false}
              />
            </div>

            {/* Right Output & Mascot Feedback Area */}
            <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col justify-between bg-[#191919] font-mono text-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-400 text-[11px] border-b border-white/10 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#FFD84D]" /> Console Output
                  </span>
                  {output && <span className="text-[#B8E63E] font-bold">EXIT 0</span>}
                  {error && <span className="text-[#EF4444] font-bold">ERROR</span>}
                </div>

                <div className="bg-black/40 rounded-xl p-3 min-h-[140px] max-h-[220px] overflow-y-auto text-gray-300 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                  {output && <span className="text-[#B8E63E]">{output}</span>}
                  {error && <span className="text-[#EF4444]">{error}</span>}
                  {!output && !error && (
                    <span className="text-gray-600 italic">
                      Click &ldquo;Run Code&rdquo; to send this snippet directly to our containerized runner.
                    </span>
                  )}
                </div>
              </div>

              {/* Character commentary */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-gray-500 font-bold block">Sandbox State</span>
                  <span className="text-xs font-bold text-white">
                    {mascotStatus === 'typing'
                      ? 'Compiling in container...'
                      : mascotStatus === 'success'
                      ? 'Clean execution!'
                      : mascotStatus === 'failure'
                      ? 'Review trace and iterate'
                      : 'Awaiting your command'}
                  </span>
                </div>
                <CodeMascot state={mascotStatus} size={80} showSpeechBubble={false} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <a
            href="#rounds"
            className="text-xs font-mono font-black text-[#3155FF] uppercase tracking-wider flex items-center gap-2 hover:underline"
          >
            Advance to the 3 Competition Rounds <ArrowDown className="w-3.5 h-3.5" />
          </a>
          <span className="text-xs font-mono text-gray-500">
            Next: C Foundation, Python Logic, Java Mastery
          </span>
        </div>
      </div>
    </section>
  );
};
