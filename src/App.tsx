import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReferrerSignup from './pages/ReferrerSignup';
import ReferralLanding from './pages/ReferralLanding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public — referrer signs up here to become an affiliate. */}
        <Route path="/" element={<ReferrerSignup />} />

        {/* Public — prospects who clicked a referrer's tracking link land here.
            GHL's affiliate cookie should already be set by the time they arrive;
            we also forward any ?ref / ?affiliate_id params to the form payload. */}
        <Route path="/invitacion" element={<ReferralLanding />} />

        {/* Auth — magic-link login form. Redirects to /dashboard or /admin once
            the session is established. */}
        <Route path="/login" element={<Login />} />

        {/* Authed — affiliate sees their own stats + link. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Authed admin only — leaderboard + payout + affiliate management. */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
