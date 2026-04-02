export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-5xl font-bold mb-4">PhotoDrop</h1>
      <p className="text-lg mb-6">Deliver photos to clients instantly</p>

      <div className="flex gap-4">
        <a href="/login" className="bg-white text-black px-6 py-2 rounded-xl">
          Login
        </a>
        <a href="/signup" className="border px-6 py-2 rounded-xl">
          Get Started
        </a>
      </div>
    </main>
  );
}