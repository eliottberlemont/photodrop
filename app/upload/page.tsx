'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    try {
      console.log('upload clicked', file)

      if (!file) {
        alert('Please select a file')
        return
      }

      setUploading(true)

      const fileName = `${Date.now()}-${file.name}`

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      console.log('upload result', { data, error })

      if (error) {
        alert(error.message)
        return
      }

      alert('Uploaded!')
    } catch (err) {
      console.error('upload catch error:', err)
      alert(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl mb-6">Upload Photos</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-white text-black px-6 py-2 rounded disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </main>
  )
}