'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Play, Loader2, CheckCircle2, XCircle, Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface SampleProblem {
  title: string;
  desc: string;
  sampleInput: string;
  expected: string;
  starter: Record<string, string>;
}

const SAMPLE_PROBLEMS: Record<string, SampleProblem> = {
  python: {
    title: 'Two Sum Target Finder',
    desc: 'Read a space-separated array of integers and a target sum, output whether any pair sums to target.',
    sampleInput: '2 7 11 15\n9',
    expected: 'YES',
    starter: {
      python: `import sys

def solve():
    input_data = sys.stdin.read().splitlines()
    if len(input_data) < 2:
        return
    nums = list(map(int, input_data[0].split()))
    target = int(input_data[1])
    
    seen = set()
    for n in nums:
        if (target - n) in seen:
            print("YES")
            return
        seen.add(n)
    print("NO")

if __name__ == '__main__':
    solve()
`,
      c: `#include <stdio.h>

int main() {
    int nums[4] = {2, 7, 11, 15};
    int target = 9;
    // Simple verification check
    for(int i = 0; i < 4; i++) {
        for(int j = i + 1; j < 4; j++) {
            if(nums[i] + nums[j] == target) {
                printf("YES\\n");
                return 0;
            }
        }
    }
    printf("NO\\n");
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextLine()) return;
        String[] parts = sc.nextLine().split(" ");
        int target = sc.nextInt();
        
        Set<Integer> seen = new HashSet<>();
        for (String p : parts) {
            int n = Integer.parseInt(p);
            if (seen.contains(target - n)) {
                System.out.println("YES");
                return;
            }
            seen.add(n);
        }
        System.out.println("NO");
    }
}
`
    }
  }
};

export const CodePlaygroundSection: React.FC = () => {
  const [lang, setLang] = useState<'python' | 'c' | 'java'>('python');
  const [code, setCode] = useState<string>(SAMPLE_PROBLEMS.python.starter.python);
  const [input, setInput] = useState<string>(SAMPLE_PROBLEMS.python.sampleInput);
  const [output, setOutput] = useState<string>('');
  const [running, setRunning] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number | null>(null);

  const handleLangChange = (newLang: 'python' | 'c' | 'java') => {
    setLang(newLang);
    setCode(SAMPLE_PROBLEMS.python.starter[newLang]);
    setStatus(null);
    setOutput('');
  };

  const handleRun = async () => {
    setRunning(true);
    setStatus('RUNNING');
    setOutput('Compiling and executing in isolated container...');

    try {
      const res = await api.submissions.runPlayground({
        language: lang,
        sourceCode: code,
        customInput: input
      });

      const actualOut = res.results?.[0]?.actualOutput || res.compileOutput || 'No output produced';
      setOutput(actualOut);
      setStatus(res.overallStatus || 'PASSED');
      setExecTime(res.executionTimeMs || 0);
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
      setStatus('ERROR');
    } finally {
      setRunning(false);
    }
  };

  return (
    <section id="playground" className="py-24 px-4 bg-[#F7F4ED] border-b-2 border-[#171717]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3155FF] text-white font-mono text-xs font-black brutal-border brutal-shadow-sm uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Sandbox
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#171717]">
            CODE PLAYGROUND
          </h2>
          <p className="text-base text-gray-700 font-medium">
            Try a sample problem before the real battle. Test real code execution against standard input in our isolated sandbox.
          </p>
        </div>

        {/* Playground Workstation Box */}
        <div className="bg-white rounded-2xl brutal-border brutal-shadow-lg overflow-hidden">
          {/* Top Bar with Language Selector & Run Button */}
          <div className="bg-[#171717] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#171717]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-gray-400 uppercase">Select Language:</span>
              <div className="flex items-center gap-2">
                {(['c', 'python', 'java'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLangChange(l)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all ${
                      lang === l
                        ? 'bg-[#FF6B35] text-white brutal-border brutal-shadow-sm'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {l === 'c' ? '01. C' : l === 'python' ? '02. Python' : '03. Java'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRun}
              disabled={running}
              className="px-6 py-2 bg-[#B8E63E] text-[#171717] font-black text-xs uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center gap-2 disabled:opacity-50"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Compiling...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Run Code (Playground)
                </>
              )}
            </button>
          </div>

          {/* Editor & Console Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x-2 divide-[#171717]">
            {/* Left: Monaco Editor */}
            <div className="lg:col-span-7 h-[420px] bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={lang === 'c' ? 'c' : lang === 'python' ? 'python' : 'java'}
                value={code}
                onChange={(v) => setCode(v || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  padding: { top: 16 }
                }}
              />
            </div>

            {/* Right: Input & Output Panel */}
            <div className="lg:col-span-5 flex flex-col justify-between h-[420px] bg-[#F7F4ED] p-4 space-y-4">
              {/* Custom Input Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#171717] uppercase flex items-center gap-1.5">
                  <TerminalIcon className="w-3.5 h-3.5 text-[#3155FF]" /> Custom Standard Input (stdin):
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-white font-mono text-xs rounded-lg brutal-border focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                  placeholder="Enter sample input data..."
                />
              </div>

              {/* Output Panel */}
              <div className="flex-1 flex flex-col space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#171717] uppercase">
                    Execution Output:
                  </span>
                  {status && (
                    <span
                      className={`text-[11px] font-mono font-black px-2 py-0.5 rounded brutal-border ${
                        status === 'PASSED'
                          ? 'bg-[#B8E63E] text-[#171717]'
                          : status === 'RUNNING'
                          ? 'bg-[#FFD84D] text-[#171717]'
                          : 'bg-red-400 text-white'
                      }`}
                    >
                      {status} {execTime !== null && `(${execTime}ms)`}
                    </span>
                  )}
                </div>
                <div className="flex-1 bg-[#171717] text-white p-3 rounded-lg font-mono text-xs overflow-y-auto brutal-border">
                  {output ? (
                    <pre className="text-[#B8E63E] whitespace-pre-wrap">{output}</pre>
                  ) : (
                    <span className="text-gray-500 italic">
                      Click &quot;Run Code&quot; to execute your solution in the isolated sandbox.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
