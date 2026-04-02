'use client';

export default function LoginPage() {
  return (
    <>
      <div className="auth-page">
        <header className="header">
          <a href="/" className="brand">PhotoDrop</a>

          <nav className="nav">
            <a href="/">Home</a>
            <a href="/signup">Sign Up</a>
          </nav>
        </header>

        <main className="auth-wrap">
          <section className="auth-left">
            <p className="eyebrow">Welcome back</p>
            <h1>Log in to your PhotoDrop account.</h1>
            <p className="subtext">
              Access your dashboard, manage client photo folders, and keep delivery
              simple and professional.
            </p>

            <div className="info-card">
              <p className="info-label">Why businesses use PhotoDrop</p>
              <ul>
                <li>Clean client experience</li>
                <li>Fast photo delivery</li>
                <li>Simple project organization</li>
              </ul>
            </div>
          </section>

          <section className="auth-card">
            <p className="card-label">Login</p>
            <h2>Welcome back</h2>

            <form className="auth-form">
              <label>Email</label>
              <input type="email" placeholder="you@business.com" />

              <label>Password</label>
              <input type="password" placeholder="Enter your password" />

              <button type="submit" className="btn btn-primary">Log In</button>
            </form>

            <p className="auth-footer">
              Don’t have an account? <a href="/signup">Create one</a>
            </p>
          </section>
        </main>
      </div>

      <style jsx>{`
        :global(body) {
          margin: 0;
          background: linear-gradient(180deg, #faf7f0 0%, #f1eadc 100%);
          font-family: Arial, Helvetica, sans-serif;
          color: #16202a;
        }

        :global(*) {
          box-sizing: border-box;
        }

        .auth-page {
          min-height: 100vh;
        }

        .header {
          max-width: 1200px;
          margin: 0 auto;
          padding: 26px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .brand {
          text-decoration: none;
          font-size: 38px;
          font-weight: 800;
          color: #2f9a45;
          letter-spacing: -0.04em;
        }

        .nav {
          display: flex;
          gap: 20px;
        }

        .nav a {
          text-decoration: none;
          color: #31456a;
          font-weight: 700;
        }

        .auth-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: grid;
          grid-template-columns: 1fr 480px;
          gap: 48px;
          align-items: center;
          min-height: calc(100vh - 100px);
        }

        .eyebrow {
          margin: 0 0 12px;
          text-transform: uppercase;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #607055;
        }

        .auth-left h1 {
          margin: 0;
          font-size: clamp(42px, 6vw, 76px);
          line-height: 0.98;
          font-weight: 300;
          letter-spacing: -0.05em;
          max-width: 650px;
        }

        .subtext {
          margin-top: 24px;
          max-width: 620px;
          font-size: 20px;
          line-height: 1.7;
          color: #465160;
        }

        .info-card {
          margin-top: 32px;
          max-width: 460px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(22, 32, 42, 0.08);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 14px 36px rgba(68, 59, 35, 0.08);
        }

        .info-label {
          margin: 0 0 14px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          color: #657184;
        }

        .info-card ul {
          margin: 0;
          padding-left: 18px;
          color: #344152;
          line-height: 1.9;
          font-size: 17px;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(22, 32, 42, 0.08);
          border-radius: 30px;
          padding: 34px;
          box-shadow: 0 24px 60px rgba(57, 56, 45, 0.14);
          backdrop-filter: blur(10px);
        }

        .card-label {
          margin: 0 0 8px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #657184;
        }

        .auth-card h2 {
          margin: 0 0 24px;
          font-size: 34px;
        }

        .auth-form {
          display: grid;
          gap: 14px;
        }

        .auth-form label {
          font-size: 15px;
          font-weight: 700;
          color: #223047;
        }

        .auth-form input {
          width: 100%;
          padding: 16px 18px;
          border-radius: 16px;
          border: 1px solid rgba(22, 32, 42, 0.12);
          background: #fff;
          font-size: 16px;
          outline: none;
        }

        .auth-form input:focus {
          border-color: #48ae4d;
          box-shadow: 0 0 0 3px rgba(72, 174, 77, 0.12);
        }

        .btn {
          margin-top: 10px;
          border: none;
          border-radius: 999px;
          padding: 16px 20px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-primary {
          background: #efc93f;
          color: #16202a;
          box-shadow: 0 8px 22px rgba(164, 129, 20, 0.18);
        }

        .auth-footer {
          margin: 20px 0 0;
          color: #4d5867;
        }

        .auth-footer a {
          color: #2f9a45;
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 900px) {
          .auth-wrap {
            grid-template-columns: 1fr;
          }

          .auth-left h1 {
            font-size: 46px;
          }
        }
      `}</style>
    </>
  );
}