import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, User, Send, FileText, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

interface Message {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isLoading?: boolean;
}

const Collaborate = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/datasets/')
      .then(r => r.json())
      .then(data => {
        // Only datasets that have been profiled can be queried
        const ready = data.filter((d: any) => d.status !== 'UPLOADED');
        setDatasets(ready);
      })
      .catch(() => setDatasets([]));
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: `I've loaded **${selectedDataset.name}** (${(selectedDataset.row_count || 0).toLocaleString()} rows × ${selectedDataset.column_count} columns). I have a complete statistical profile of this dataset. What would you like to know?

Here are some questions you can ask:
- "Which column has the most missing values?"
- "What is the average value of [column]?"
- "Are there any outliers in this data?"
- "Summarize the data quality for me."`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [selectedDataset]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending || !selectedDataset) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const loadingMsg: Message = {
      id: Date.now() + 1,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    const question = inputValue;
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: selectedDataset.id, question }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'AI request failed');
      }

      const data = await response.json();

      setMessages(prev =>
        prev.map(m => m.isLoading ? { ...m, text: data.answer, isLoading: false } : m)
      );
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.isLoading
            ? { ...m, text: `Error: ${err.message}`, isLoading: false }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const renderText = (text: string) => {
    // Basic markdown bold rendering
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
          j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="h-[calc(100vh-8rem)] max-w-4xl mx-auto flex flex-col">
      <header className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Human-AI Collaboration</h2>
        <p className="text-slate-400">Ask DataDoctor AI anything about your uploaded datasets.</p>
      </header>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden">
        {/* Chat Header with Dataset Selector */}
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">DataDoctor AI</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Powered by Gemini 1.5 Flash
              </p>
            </div>
          </div>

          <div className="relative">
            {datasets.length === 0 ? (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                No profiled datasets yet — upload one first!
              </span>
            ) : (
              <select
                value={selectedDataset?.id || ''}
                onChange={e => {
                  const d = datasets.find(d => d.id === parseInt(e.target.value));
                  setSelectedDataset(d || null);
                }}
                className="appearance-none bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="">— Select a Dataset —</option>
                {datasets.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!selectedDataset ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
              <Brain className="w-16 h-16 opacity-30" />
              <p>Select a dataset above to start chatting with DataDoctor AI.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-primary/20 text-primary'
                }`}>
                  {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                </div>

                <div className={`max-w-[80%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-slate-400">
                      {msg.sender === 'user' ? 'You' : 'DataDoctor AI'}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>

                  <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}>
                    {msg.isLoading ? (
                      <div className="flex items-center gap-2 py-1">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-slate-400 text-xs">DataDoctor is thinking...</span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{renderText(msg.text)}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-800/30 border-t border-slate-700/50">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={selectedDataset ? `Ask anything about ${selectedDataset.name}...` : "Select a dataset first..."}
              disabled={!selectedDataset || isSending}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-4 pl-4 pr-12 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || !selectedDataset || isSending}
              className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-500 mt-3">
            Powered by DataDoctor AI (Gemini 1.5 Flash) — Reads your actual data and answers with real statistics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Collaborate;
