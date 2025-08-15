export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold">ReliefFlow</h1>
        <p className="text-neutral-600 max-w-xl">Concurrency-safe emergency resource allocation. Browse slots, hold resources for 5 minutes, and confirm reservations.</p>
        <div className="flex gap-4">
          <a className="underline" href="/browse">Find resources</a>
          {/* NextAuth signin is not a page route; ignore lint rule here */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="underline" href="/api/auth/signin">Organization login</a>
        </div>
      </main>
    </div>
  );
}
