'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Database, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  Play, 
  RotateCcw,
  Loader2,
  Cpu,
  Bot
} from 'lucide-react';

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'sql'>('chat');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT primary_name, object_type, distance_ly, apparent_magnitude FROM celestial_objects WHERE distance_ly < 25 ORDER BY distance_ly ASC LIMIT 10;');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string; toolCall?: any; toolResult?: any }>>([
    {
      role: 'assistant',
      content: 'Greetings! I am connected to the AstroDB PostgreSQL & pgvector knowledge engine. Ask me anything about exoplanets, stellar spectra, astrobiology metrics, or orbital mechanics.',
    },
  ]);

  const presetPrompts = [
    'Find rocky exoplanets in the habitable zone with high Earth Similarity Index',
    'What are the closest star systems to Earth within 15 light years?',
    'List compact relics or pulsars with the highest spin frequencies',
    'Show me exoplanets discovered by Transit method around G-type stars',
  ];

  const handleSendPrompt = async (textToSend?: string) => {
    const text = textToSend || prompt;
    if (!text.trim() || loading) return;

    const userMsg = { role: 'user', content: text };
    setChatHistory((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      // Step 1: Query Search API
      const searchRes = await fetch(`/api/v1/search?q=${encodeURIComponent(text)}&limit=5`);
      const searchData = await searchRes.json();

      const toolCall = {
        name: 'search_celestial_objects',
        arguments: { query: text, limit: 5 },
      };

      const toolResult = searchData.results || searchData.data || [];

      // Synthesize answer based on tool output
      let answer = '';
      if (toolResult.length === 0) {
        answer = `I queried the AstroDB catalog for "${text}", but no matching records were found within the current constraints.`;
      } else {
        const top = toolResult[0];
        answer = `Found ${toolResult.length} matching astronomical objects. Primary match: **${top.primary_name || top.title}** (${top.object_type || top.category || 'Object'}), situated at a distance of **${top.distance_ly ? `${Number(top.distance_ly).toLocaleString()} ly` : 'N/A'}** in constellation **${top.constellation || 'N/A'}**.\n\nKey parameters:\n` +
          toolResult.slice(0, 3).map((item: any) => `• **${item.primary_name || item.title}**: ${item.object_type || item.category}, Mag: ${item.apparent_magnitude ?? '—'}, Coordinates: ${item.ra_deg ? `${Number(item.ra_deg).toFixed(2)}°` : '—'}`).join('\n');
      }

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
          toolCall,
          toolResult,
        },
      ]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: `Error querying AstroDB: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSql = async () => {
    if (!sqlQuery.trim() || loading) return;
    setLoading(true);
    setSqlResult(null);

    try {
      const res = await fetch('/api/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery }),
      });
      const json = await res.json();
      setSqlResult(json);
    } catch (err: any) {
      setSqlResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-space-cyan" />
          AI Agent Playground & Tool Testbench
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Simulate autonomous AI agent tool calls, test semantic queries, and inspect raw JSON payloads.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'chat'
              ? 'bg-space-cyan text-space-950 shadow-md'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Bot className="w-4 h-4" />
          Agent Natural Language Chat
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'sql'
              ? 'bg-space-cyan text-space-950 shadow-md'
              : 'bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Direct SQL Sandbox
        </button>
      </div>

      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chat Window */}
          <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col h-[620px]">
            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] font-mono text-slate-400 mb-1">
                    {msg.role === 'user' ? 'AI Agent / User' : 'AstroDB Tool Engine'}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[88%] ${
                      msg.role === 'user'
                        ? 'bg-space-cyan text-space-950 font-medium'
                        : 'bg-space-950/80 border border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>

                    {/* Tool Execution Card */}
                    {msg.toolCall && (
                      <div className="mt-3 pt-3 border-t border-white/10 text-[11px] font-mono text-slate-300 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-space-cyan font-bold">
                          <Cpu className="w-3.5 h-3.5" />
                          Tool Executed: {msg.toolCall.name}
                        </div>
                        <pre className="p-2 rounded bg-black/40 text-[10px] text-slate-300 overflow-x-auto">
                          {JSON.stringify(msg.toolCall.arguments, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-space-cyan font-mono py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Agent formulating tool calls over 16 tables...</span>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask a scientific astrophysics query..."
                  className="flex-1 px-4 py-3 bg-space-950/80 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-space-cyan"
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="px-5 py-3 bg-space-cyan text-space-950 font-bold rounded-xl text-xs hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Query
                </button>
              </form>
            </div>
          </div>

          {/* Preset Prompts Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-space-cyan font-mono">
                Sample Agent Prompts
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click any prompt to trigger simulated autonomous tool selection and database retrieval:
              </p>

              <div className="space-y-2 pt-2">
                {presetPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendPrompt(p)}
                    className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-slate-300 hover:text-white transition-all flex items-start gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-space-cyan mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SQL Sandbox View */
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-slate-400">
              Safe Read-Only SQL Query Runner (SELECT Queries Only)
            </div>
            <button
              onClick={handleRunSql}
              disabled={loading}
              className="px-4 py-2 bg-space-cyan text-space-950 font-bold rounded-xl text-xs hover:brightness-110 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow"
            >
              <Play className="w-3.5 h-3.5" />
              Execute SQL
            </button>
          </div>

          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            rows={4}
            className="w-full p-4 bg-space-950 border border-white/15 rounded-2xl text-xs font-mono text-emerald-400 focus:outline-none focus:border-space-cyan"
          />

          {/* Results Output */}
          {sqlResult && (
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Execution Result ({sqlResult.rowCount || sqlResult.data?.length || 0} rows)</span>
                <span className="text-[10px] text-space-cyan">{sqlResult.source || 'Engine'}</span>
              </div>
              <pre className="p-4 bg-space-950 rounded-2xl border border-white/10 text-xs font-mono text-slate-300 max-h-[350px] overflow-auto">
                {JSON.stringify(sqlResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
