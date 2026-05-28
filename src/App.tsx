import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ReferrerSignup from './pages/ReferrerSignup';
import ReferralLanding from './pages/ReferralLanding';

function App() {
  return (
    <Router>
      <Routes>
        {/* Referrer-facing: existing buyers / ambassadors generate their tracking link. */}
        <Route path="/" element={<ReferrerSignup />} />

        {/* Referee-facing: prospects who clicked a referrer's tracking link.
            GHL's affiliate cookie should already be set by the time they arrive;
            we also forward any ?ref / ?affiliate_id params to the form payload. */}
        <Route path="/invitacion" element={<ReferralLanding />} />
      </Routes>
    </Router>
  );
}

export default App;
