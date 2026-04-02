'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabase();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <div className="authPage">
        <header className="header">
          <Link href="/" className="brand">
            PhotoDrop
          </Link>

          <nav className="nav">
            <Link href="/" className="navLink">Home</Link>
            <Link href="/signup" className="navLink">Sign Up</Link>
          </nav>
        </header>

        <main className="authWrap">
          <section className="authLeft">
            <p className="eyebrow">Welcome back</p>
            <h1 className="title">Log in to your PhotoDrop account.</h1>
            <p className="subtext">
              Access your dashboard and manage your client photos.
            </p>
          </section>

          <section className="authCard">
            <h2>Login</h2>

            <div className="authForm">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && <p className="error">{error}</p>}

              <button onClick={handleLogin} className="btnPrimary">
                Log In
              </button>
            </div>

            <p className="authFooter">
              Don’t have an account? <Link href="/signup">Create one</Link>
            </p>
          </section>
        </main>
      </div>

      <style jsx>{`
        .authPage {
          min-height: 100vh;
          background: linear-gradient(180deg, #faf7f0 0%, #f1eadc 100%);
          font-family: Arial;
        }

        .header {
          display: flex;
          justify-content: space-between;
          padding: 24px;
          max-width: 1100px;
          margin: auto;
        }

        .brand {
          font-size: 32px;
          font-weight: bold;
          color: #2f9a45;
          text-decoration: none;
        }

        .nav {
          display: flex;
          gap: 16px;
        }

        .navLink {
          text-decoration: none;
          color: #333;
          font-weight: 600;
        }

        .authWrap {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          max-width: 1100px;
          margin: auto;
          padding: 40px 20px;
        }

        .title {
          font-size: 48px;
        }

        .authCard {
          background: white;
          padding: 30px;
          border-radius: 20px;
        }

        .authForm {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        input {
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #ccc;
        }

        .btnPrimary {
          margin-top: 10px;
          padding: 14px;
          border-radius: 999px;
          border: none;
          background: #efc93f;
          font-weight: bold;
          cursor: pointer;
        }

        .error {
          color: red;
          font-size: 14px;
        }

        .authFooter {
          margin-top: 16px;
        }

        @media (max-width: 800px) {
          .authWrap {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}