import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import MeetingsList from './MeetingsList';
import Chat from './Chat';

export default async function ChatPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['meetings'],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/meetings`).then((res) =>
        res.json(),
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex h-screen gap-6 p-6">
        <MeetingsList />
        <Chat />
      </main>
    </HydrationBoundary>
  );
}
