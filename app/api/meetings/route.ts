import { NextResponse } from 'next/server';

// mock data
const meetings = [
  {
    id: '1',
    title: 'Онбординг с командой',
    date: '2025-08-10T10:00:00Z',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'Ревью кода',
    date: '2025-08-07T14:00:00Z',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'Синк с дизайнером',
    date: '2025-07-30T11:00:00Z',
    status: 'completed',
  },
  {
    id: '4',
    title: 'Планирование спринта',
    date: '2025-07-28T09:00:00Z',
    status: 'completed',
  },
  {
    id: '5',
    title: 'Демо для клиента',
    date: '2025-08-15T16:00:00Z',
    status: 'cancelled',
  },
];

export async function GET() {
  return NextResponse.json(meetings);
}
