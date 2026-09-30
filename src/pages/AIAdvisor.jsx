import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, MapPin, Mic, Send, Sparkles, User, Volume2 } from 'lucide-react';

const AIAdvisor = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello. I can help you review weather, crop notes and field activity for North Field. What would you like to check today?',
      context: 'Field context',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (event) => {
    event?.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', content: input };
    setMessages((previous) => [...previous, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const nextMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          'Your North Field has a soil moisture level of 64% and rain is likely over the next 48 hours. It is reasonable to delay irrigation unless the north edge dries quickly after the next shower.',
        context: 'Based on current field data',
      };
      setIsTyping(false);
      setMessages((previous) => [...previous, nextMessage]);
    }, 1200);
  };

  const quickQuestions = [
    'Should I irrigate today?',
    'What should I check today?',
    'What changed in the field?',
    'Any weather-related risk?',
  ];

  return (
    <div className="mx-auto flex h-[calc(100vh-150px)] w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Ask</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-slate-900">Ask about your field</h1>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Crop</div>
              <div className="font-semibold text-slate-900">Wheat</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Moisture</div>
              <div className="font-semibold text-slate-900">64%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_44px_-28px_rgba(15,23,42,0.6)]">
        <div className="flex-1 overflow-y-auto bg-slate-50/80 p-4 sm:p-6">
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-3 sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>

                  <div className="flex flex-col gap-1">
                    {msg.context && <span className="px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{msg.context}</span>}
                    <div className={`rounded-[22px] px-4 py-3 text-sm leading-7 sm:text-base ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                      {msg.content}
                    </div>
                    {msg.role === 'assistant' && msg.id !== 1 && (
                      <button className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <Volume2 className="h-3.5 w-3.5" /> Listen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-[75%] gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-[22px] border border-slate-200 bg-white px-4 py-3">
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0ms' }} />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '150ms' }} />
                    <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            {quickQuestions.map((question) => (
              <button key={question} type="button" onClick={() => setInput(question)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100">
                {question}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-end gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-[22px] border border-slate-200 bg-slate-50 px-2.5 py-2 focus-within:border-emerald-500 focus-within:bg-white">
              <button type="button" className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800">
                <ImageIcon className="h-5 w-5" />
              </button>
              <button type="button" className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 sm:block">
                <MapPin className="h-5 w-5" />
              </button>
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your field..." className="flex-1 border-none bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <button type="button" className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800">
                <Mic className="h-5 w-5" />
              </button>
            </div>

            <button type="submit" disabled={!input.trim() || isTyping} className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
