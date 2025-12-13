import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from './services/jobService';
import Login from './components/Login';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import JobFormPage from './pages/JobFormPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SharePage from './pages/SharePage';
import AiSettingsPage from './pages/AiSettingsPage';
import PublicSharePage from './pages/PublicSharePage';

function AppContent() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    navigate('/login');
  };

  if (!authenticated) {
    return <Login onLoginSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<JobsPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/new" element={<JobFormPage />} />
          <Route path="/jobs/:id/edit" element={<JobFormPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ai-settings" element={<AiSettingsPage />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="/share/:token" element={<PublicSharePage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
