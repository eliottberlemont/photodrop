'use client'

export default function Dashboard() {
const handleConnect = () => {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: `${window.location.origin}/api/google/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/drive.file',
    access_type: 'offline',
    prompt: 'consent',
  })

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl mb-6">Dashboard</h1>

      <div className="grid gap-4 max-w-md">
        <button
          onClick={handleConnect}
          className="bg-green-500 text-black p-4 rounded-xl"
        >
          Connect Google Drive
        </button>

        <a
          href="/upload"
          className="bg-white text-black p-4 rounded-xl text-center"
        >
          Upload Photos
        </a>

        <button className="border p-4 rounded-xl">
          View Galleries
        </button>
      </div>
    </main>
  )
}