'use client'

export const dynamic = "force-dynamic";

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async () => {
    console.log('signup clicked', { email, password })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log('signup result', { data, error })

    if (error) {
      alert(error.message)
    } else {
      alert('Account created!')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-2xl w-80">
        <h2 className="text-2xl mb-4">Create Account</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-black border"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-black border"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-white text-black py-2 rounded"
        >
          Sign Up
        </button>
      </div>
    </main>
  )
}