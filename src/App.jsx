import { useEffect, useState } from 'react';
import AuthCard from './components/AuthCard';
import Dashboard from './components/Dashboard';
import { request } from './api/client';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await request('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Backend developer assignment</span>
          <h1>MERN Auth + Tasks</h1>
        </div>
        <p>Express, MongoDB, React, JWT cookies, role-based access, and a Swagger-ready API.</p>
      </header>

      {loading ? <div className="panel loading-panel">Loading session...</div> : null}

      {!loading && !user ? <AuthCard onAuthSuccess={setUser} /> : null}

      {!loading && user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : null}
    </div>
  );
}

export default App;
