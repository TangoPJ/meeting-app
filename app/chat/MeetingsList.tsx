'use client';

import { useQuery } from '@tanstack/react-query';

type Meeting = {
  id: string;
  title: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
};

const statusLabel: Record<Meeting['status'], string> = {
  upcoming: 'Предстоит',
  completed: 'Завершена',
  cancelled: 'Отменена',
};

const statusColor: Record<Meeting['status'], string> = {
  upcoming: 'text-blue-500',
  completed: 'text-green-500',
  cancelled: 'text-red-400',
};

export default function MeetingsList() {
  const {
    data: meetings,
    refetch,
    isFetching,
  } = useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/meetings`).then((res) =>
        res.json(),
      ),
  });

  return (
    <aside className="flex w-80 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Встречи</h2>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-sm text-blue-500 hover:underline disabled:opacity-50"
        >
          {isFetching ? 'Загрузка...' : 'Обновить'}
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="rounded-lg border bg-white p-3 shadow-sm"
          >
            <p className="text-sm font-medium">{meeting.title}</p>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(meeting.date).toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p
              className={`mt-1 text-xs font-medium ${statusColor[meeting.status]}`}
            >
              {statusLabel[meeting.status]}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
