'use client';

import { useState } from 'react';
import { useWebSocket, type Message } from './hooks';

export default function Chat() {
  const { messages, status, sendMessage, retryPending } = useWebSocket();
  const [input, setInput] = useState('');

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage(text);
    setInput('');
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
      {/* Status */}
      <div
        className={`flex items-center justify-between px-4 py-2 text-sm font-medium ${status === 'connected' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}
      >
        <span>
          {status === 'connected' && 'Подключено'}
          {status === 'reconnecting' && 'Нет связи — переподключение...'}
          {status === 'disconnected' && 'Отключено'}
        </span>
        {status !== 'connected' && (
          <button
            onClick={retryPending}
            className="text-xs underline hover:no-underline"
          >
            Повторить
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t p-3">
        <input
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Введите сообщение..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Отправить
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isMe = message.from === 'me';

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs rounded-lg px-3 py-2 text-sm ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} ${message.pending ? 'opacity-60' : ''} `}
      >
        <p>{message.text}</p>
        {message.pending && (
          <p className="mt-1 text-xs opacity-70">⏳ не отправлено</p>
        )}
      </div>
    </div>
  );
}
