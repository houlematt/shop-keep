import { useEffect, useState } from 'react';
import './App.css';

export default function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) setHealth({ error: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app">
      <h1>shop-keep</h1>
      <p className="lede">React UI with a Hapi API.</p>
      <section className="panel">
        <h2>API check</h2>
        {!health && <p>Loading /api/health…</p>}
        {health?.error && (
          <p className="error">Could not reach the API. Is the server running on port 3000?</p>
        )}
        {health && !health.error && (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        )}
      </section>
    </main>
  );
}
