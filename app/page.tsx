'use client';

export default function PhotoDropLandingPage() {
  return (
    <>
      <div className="page">
        <header className="header">
          <div className="brand">PhotoDrop</div>

          <nav className="nav">
            <a href="#platform">Platform</a>
            <a href="#solutions">Solutions</a>
            <a href="#about">About</a>
            <a href="#pricing">Pricing</a>
          </nav>

          <div className="actions">
            <button className="btn btn-outline">Login</button>
            <button className="btn btn-primary">Book Demo</button>
          </div>
        </header>

        <section className="announcement">
          Professional photo delivery for modern businesses
        </section>

        <main className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Built for photographers, media teams, and service businesses</p>
            <h1>
              The easiest way to organize and deliver business photos.
            </h1>
            <p className="subtext">
              PhotoDrop gives your business a polished client experience with clean uploads,
              organized folders, and simple photo delivery in one place.
            </p>

            <div className="hero-buttons">
              <button className="btn btn-primary btn-large">Book a Live Demo</button>
              <button className="btn btn-secondary btn-large">Explore Platform</button>
            </div>
          </div>

          <div className="hero-card">
            <div className="dashboard-window">
              <div className="window-top">
                <div>
                  <p className="mini-label">Client workspace</p>
                  <h3>Sunset Media Group</h3>
                </div>
                <span className="status-pill">128 photos uploaded</span>
              </div>

              <div className="dashboard-grid">
                <div className="panel">
                  <p className="panel-label">Recent folders</p>
                  <div className="folder-list">
                    <div className="folder-row"><span>Spring Listings</span><span>Open</span></div>
                    <div className="folder-row"><span>Team Headshots</span><span>Open</span></div>
                    <div className="folder-row"><span>Downtown Properties</span><span>Open</span></div>
                  </div>
                </div>

                <div className="panel panel-highlight">
                  <p className="panel-label">This month</p>
                  <div className="metric">94%</div>
                  <p className="metric-copy">client delivery completion</p>
                  <div className="progress-track">
                    <div className="progress-fill" />
                  </div>
                  <p className="small-copy">
                    Give clients a premium experience from upload to final delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <section className="preview-section">
          <div className="preview-image">
            <div className="preview-overlay">
              <div className="preview-badge">Clean dashboard preview</div>
            </div>
          </div>
        </section>

        <section className="features" id="platform">
          <div className="feature-card">
            <h3>Fast uploads</h3>
            <p>Quickly send photos into organized client folders without messy workflows.</p>
          </div>
          <div className="feature-card">
            <h3>Professional delivery</h3>
            <p>Give customers a modern login experience that feels clean and trustworthy.</p>
          </div>
          <div className="feature-card">
            <h3>Simple organization</h3>
            <p>Keep every property, project, or business neatly sorted in one platform.</p>
          </div>
        </section>
      </div>

      <style jsx>{`
        :global(body) {
          margin: 0;
          background: #f6f1e7;
          color: #18202a;
          font-family: Arial, Helvetica, sans-serif;
        }

        :global(*) {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255,255,255,0.8), transparent 28%),
            linear-gradient(180deg, #faf7f0 0%, #f3ecdf 100%);
        }

        .header {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 26px 24px;
          background: rgba(255,255,255,0.82);
          border-bottom: 1px solid rgba(24, 32, 42, 0.08);
          position: sticky;
          top: 0;
          backdrop-filter: blur(12px);
          z-index: 10;
        }

        .brand {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #2f9a45;
        }

        .nav {
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
        }

        .nav a {
          text-decoration: none;
          color: #31456a;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .btn {
          border: none;
          border-radius: 16px;
          padding: 12px 20px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btn-outline {
          background: white;
          border: 2px solid #2a2f36;
          color: #111827;
        }

        .btn-primary {
          background: #efc93f;
          color: #18202a;
          box-shadow: 0 8px 22px rgba(164, 129, 20, 0.18);
        }

        .btn-secondary {
          background: #48ae4d;
          color: white;
          box-shadow: 0 8px 22px rgba(38, 120, 42, 0.2);
        }

        .btn-large {
          padding: 18px 28px;
          border-radius: 999px;
          font-size: 18px;
        }

        .announcement {
          background: linear-gradient(90deg, #49a64d, #295f2a);
          color: #f3f7ee;
          text-align: center;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 10px 16px;
          font-size: 14px;
        }

        .hero {
          max-width: 1200px;
          margin: 0 auto;
          padding: 70px 24px 40px;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 56px;
          align-items: center;
        }

        .eyebrow {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #5d7358;
          margin-bottom: 14px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(48px, 7vw, 86px);
          line-height: 0.98;
          font-weight: 300;
          letter-spacing: -0.05em;
          color: #101418;
          max-width: 720px;
        }

        .subtext {
          margin-top: 28px;
          max-width: 720px;
          font-size: 20px;
          line-height: 1.7;
          color: #3f4752;
        }

        .hero-buttons {
          display: flex;
          gap: 18px;
          margin-top: 36px;
          flex-wrap: wrap;
        }

        .hero-card {
          display: flex;
          justify-content: center;
        }

        .dashboard-window {
          width: 100%;
          max-width: 500px;
          background: rgba(255,255,255,0.78);
          border: 1px solid rgba(24,32,42,0.08);
          border-radius: 30px;
          padding: 24px;
          box-shadow: 0 24px 60px rgba(57, 56, 45, 0.14);
          backdrop-filter: blur(10px);
        }

        .window-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .window-top h3 {
          margin: 4px 0 0;
          font-size: 28px;
        }

        .mini-label,
        .panel-label,
        .metric-copy,
        .small-copy {
          margin: 0;
        }

        .mini-label,
        .panel-label {
          color: #657184;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          background: #eef6eb;
          color: #337840;
          border: 1px solid #c7dfc5;
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .panel {
          background: #ffffff;
          border: 1px solid rgba(24,32,42,0.08);
          border-radius: 22px;
          padding: 18px;
        }

        .panel-highlight {
          background: linear-gradient(180deg, #eff7eb 0%, #f8fbf6 100%);
        }

        .folder-list {
          margin-top: 14px;
          display: grid;
          gap: 12px;
        }

        .folder-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8f8f6;
          border-radius: 14px;
          padding: 12px 14px;
          color: #223047;
          font-size: 15px;
        }

        .metric {
          font-size: 54px;
          line-height: 1;
          font-weight: 800;
          margin-top: 12px;
          color: #102219;
        }

        .metric-copy {
          margin-top: 8px;
          color: #475467;
          font-size: 15px;
        }

        .progress-track {
          height: 12px;
          width: 100%;
          margin-top: 18px;
          background: rgba(72, 174, 77, 0.15);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          width: 94%;
          background: linear-gradient(90deg, #48ae4d, #2f8b36);
          border-radius: 999px;
        }

        .small-copy {
          margin-top: 14px;
          color: #4c5768;
          font-size: 15px;
          line-height: 1.6;
        }

        .preview-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 24px 0;
        }

        .preview-image {
          height: 420px;
          border-radius: 28px;
          overflow: hidden;
          position: relative;
          background:
            linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)),
            linear-gradient(135deg, #6c8d4d 0%, #c7a54a 45%, #7a9e4f 100%);
          box-shadow: 0 22px 50px rgba(71, 63, 34, 0.18);
        }

        .preview-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          padding: 28px;
          background: linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.02));
        }

        .preview-badge {
          background: rgba(255,255,255,0.88);
          color: #1a2230;
          padding: 12px 18px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
        }

        .features {
          max-width: 1200px;
          margin: 0 auto;
          padding: 38px 24px 80px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .feature-card {
          background: rgba(255,255,255,0.76);
          border: 1px solid rgba(24,32,42,0.08);
          border-radius: 24px;
          padding: 26px;
          box-shadow: 0 12px 30px rgba(70, 62, 39, 0.08);
        }

        .feature-card h3 {
          margin: 0 0 10px;
          font-size: 24px;
        }

        .feature-card p {
          margin: 0;
          font-size: 16px;
          line-height: 1.7;
          color: #465160;
        }

        @media (max-width: 980px) {
          .header {
            flex-wrap: wrap;
          }

          .hero {
            grid-template-columns: 1fr;
          }

          .hero h1 {
            max-width: 100%;
          }

          .dashboard-grid,
          .features {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .brand {
            font-size: 32px;
          }

          .nav {
            gap: 16px;
          }

          .nav a {
            font-size: 12px;
          }

          .hero {
            padding-top: 42px;
          }

          .hero h1 {
            font-size: 46px;
          }

          .subtext {
            font-size: 18px;
          }

          .window-top {
            flex-direction: column;
          }

          .preview-image {
            height: 280px;
          }
        }
      `}</style>
    </>
  );
}
