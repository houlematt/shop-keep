import { Link } from 'react-router-dom';
import '../App.css';

export default function HomePage() {
  return (
    <main className="app home">
      <h1 className="home-title">shop-keep</h1>
      <nav className="home-links" aria-label="Main">
        <ul>
          <li>
            <Link to="/job-sites">Job sites</Link>
          </li>
          <li>
            <Link to="/user">Users</Link>
            <span className="home-hint"> (ADMIN sign-in)</span>
          </li>
          <li>
            <Link to="/login">Sign in</Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
