import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, getUserProfile } from '../auth/storage.js';
import { userInitials } from '../auth/userInitials.js';
import '../App.css';

export default function SiteHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = getUserProfile();
  const initials = userInitials(profile);
  const title = profile?.email ? `Signed in as ${profile.email}` : 'Signed in';

  function logout() {
    clearToken();
    navigate('/login', { replace: true, state: { from: location.pathname } });
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-header-brand">
          shop-keep
        </Link>
        <div className="site-header-actions">
          <button type="button" className="btn small linkish site-header-signout" onClick={logout}>
            Sign out
          </button>
          <span className="user-avatar" title={title} aria-label={title}>
            {initials}
          </span>
        </div>
      </div>
    </header>
  );
}
