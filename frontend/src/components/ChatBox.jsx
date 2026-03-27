import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatBox({ messages = [], currentUser, onSendMessage }) {
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-64 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden mt-3 shadow-inner animate-in fade-in slide-in-from-top-2">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, idx) => {
          const isMe = msg.sender === currentUser.email;
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${isMe ? 'bg-emerald-500 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {isMe ? 'You' : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400 text-sm italic">No messages yet. Say hi!</p>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      <form onSubmit={handleSend} className="p-2 bg-white border-t border-slate-200 flex gap-2 items-center shadow-lg">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-100/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-slate-200"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} className={input.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />
        </button>
      </form>
    </div>
  );
}
