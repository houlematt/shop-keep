import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth.jsx';
import HomePage from './pages/HomePage.jsx';
import JobSitesAdminPage from './pages/JobSitesAdminPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import UserAdminPage from './pages/UserAdminPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route index element={<HomePage />} />
        <Route path="user" element={<UserAdminPage />} />
        <Route path="job-sites" element={<JobSitesAdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
