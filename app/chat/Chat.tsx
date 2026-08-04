'use client';

import { Status, useWebSocket, type Message } from './hooks';
import { useComputed, useSignal, type Signal } from '@preact/signals-react';
import { useSignals } from '@preact/signals-react/runtime';

import rsp from '@vicimpa/rsp';

const STATUSES = {
  [Status.connected]: 'Подключено',
  [Status.reconnecting]: 'Нет связи — переподключение...',
  [Status.disconnected]: 'Отключено',
} as const;

export default function Chat() {
  const { messages, status, sendMessage, retryPending } = useWebSocket();

  const input = useSignal('');
  const isDisabled = useComputed(() => !input.value.trim());

  const handleSend = () => {
    const text = input.value.trim();
    if (!text) return;
    sendMessage(text);

    // eslint-disable-next-line react-hooks/immutability
    input.value = '';
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border">
      <StatusBar status={status} retryPending={retryPending} />
      <MessageList messages={messages} />
      <div className="flex gap-2 border-t p-3">
        <rsp.input
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
          type="text"
          bind-value={input}
          placeholder="Введите сообщение..."
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <rsp.button
          onClick={handleSend}
          disabled={isDisabled}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
        >
          Отправить
        </rsp.button>
      </div>
    </div>
  );
}

function StatusBar({
  status,
  retryPending,
}: {
  status: Signal<Status>;
  retryPending: () => void;
}) {
  useSignals();
  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-sm font-medium ${status.value === Status.connected ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}
    >
      <span>{STATUSES[status.value]}</span>
      {status.value !== Status.connected && (
        <button
          onClick={retryPending}
          className="text-xs underline hover:no-underline"
        >
          Повторить
        </button>
      )}
    </div>
  );
}

function MessageList({ messages }: { messages: Signal<Message[]> }) {
  useSignals();
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
      {messages.value.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
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
