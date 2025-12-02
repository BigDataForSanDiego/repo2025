import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Navigation from './components/Navigation';

// Pages
import Home from './pages/Home';
import DonorDashboard from './pages/DonorDashboard';
import PeopleHelped from './pages/PeopleHelped';
import ImpactNetwork from './pages/ImpactNetwork';
import Donate from './pages/Donate';
import DonateConfirmation from './pages/DonateConfirmation';
import RecipientDashboard from './pages/RecipientDashboard';
import CommunityHub from './pages/CommunityHub';
import Settings from './pages/Settings';

// Layout wrapper components
const DonorLayout = ({ children }) => (
  <>
    <Header userType="donor" />
    <Navigation userType="donor" />
    {children}
  </>
);

const RecipientLayout = ({ children }) => (
  <>
    <Header userType="recipient" />
    <Navigation userType="recipient" />
    {children}
  </>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Home/Landing */}
          <Route path="/" element={<Home />} />

          {/* Donation Flow (public) */}
          <Route path="/donate" element={
            <>
              <Header userType="donor" />
              <Donate />
            </>
          } />
          <Route path="/donate/confirmation" element={
            <>
              <Header userType="donor" />
              <DonateConfirmation />
            </>
          } />

          {/* Donor Routes */}
          <Route path="/donor/dashboard" element={
            <DonorLayout>
              <DonorDashboard />
            </DonorLayout>
          } />
          <Route path="/donor/people" element={
            <DonorLayout>
              <PeopleHelped />
            </DonorLayout>
          } />
          <Route path="/donor/impact" element={
            <DonorLayout>
              <ImpactNetwork />
            </DonorLayout>
          } />
          <Route path="/donor/settings" element={
            <DonorLayout>
              <Settings userType="donor" />
            </DonorLayout>
          } />

          {/* Recipient Routes */}
          <Route path="/recipient/dashboard" element={
            <RecipientLayout>
              <RecipientDashboard />
            </RecipientLayout>
          } />
          <Route path="/recipient/community" element={
            <RecipientLayout>
              <CommunityHub />
            </RecipientLayout>
          } />
          <Route path="/recipient/discover" element={
            <RecipientLayout>
              <CommunityHub />
            </RecipientLayout>
          } />
          <Route path="/recipient/settings" element={
            <RecipientLayout>
              <Settings userType="recipient" />
            </RecipientLayout>
          } />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
