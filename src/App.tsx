import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ReferrerSignup from './pages/ReferrerSignup';
import ReferralLanding from './pages/ReferralLanding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { DEFAULT_LANG } from './i18n/translations';

// Redirect legacy unprefixed URLs to /es/... so existing affiliate links keep working.
function LegacyRedirect({ to }: { to: string }) {
  const location = useLocation();
  return <Navigate to={`/${DEFAULT_LANG}${to}${location.search}${location.hash}`} replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Root → default language landing. Mexican audience is primary. */}
        <Route path="/" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />

        {/* Language-prefixed routes (/es/* and /en/*). The pages read the
            :lang param via useLang() to pick the right translation tree. */}
        <Route path="/:lang">
          <Route index element={<ReferrerSignup />} />
          <Route path="invitacion" element={<ReferralLanding />} />
          <Route path="login" element={<Login />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Legacy unprefixed URLs → 302 to /es/... so previously-shared
            referral links and email links keep working. */}
        <Route path="/invitacion" element={<LegacyRedirect to="/invitacion" />} />
        <Route path="/login" element={<LegacyRedirect to="/login" />} />
        <Route path="/dashboard" element={<LegacyRedirect to="/dashboard" />} />
        <Route path="/admin" element={<LegacyRedirect to="/admin" />} />
      </Routes>
    </Router>
  );
}

export default App;
