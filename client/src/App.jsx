import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import JobSitesAdminPage from './pages/JobSitesAdminPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import UserAdminPage from './pages/UserAdminPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/user" element={<UserAdminPage />} />
      <Route path="/job-sites" element={<JobSitesAdminPage />} />
    </Routes>
  );
}
