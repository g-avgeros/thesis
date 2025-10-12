import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ClientSignUp from './pages/ClientSignUp';
import ProfessionalSignUp from './pages/ProfessionalSignUp';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import ProfileSettings from './pages/ProfileSettings';
import Services from './pages/Services';
import Clients from './pages/Clients';
import ClientDashboard from './pages/ClientDashboard';
import Schedule from './pages/Schedule';

function App() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/client" element={<ClientSignUp />} />
        <Route path="/register/professional" element={<ProfessionalSignUp />} />
        <Route path="/calendar" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route
            path="/client-dashboard"
            element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>}
          />
        <Route
            path="/settings"
            element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>}
          />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
