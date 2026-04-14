import { Navigate, Outlet, useLocation } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import { getToken } from './storage.js';

export default function RequireAuth() {
  const location = useLocation();
  if (!getToken()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return (
    <>
      <SiteHeader />
      <Outlet />
    </>
  );
}
