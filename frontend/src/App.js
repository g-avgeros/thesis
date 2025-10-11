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
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/client" element={<ClientSignUp />} />
        <Route path="/register/professional" element={<ProfessionalSignUp />} />
        <Route path="/calendar" element={<ProfessionalDashboard />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/services" element={<Services />} />
        <Route path="/clients" element={<Clients />} />
        <Route
            path="/client-dashboard"
            element={ token
              ? <ClientDashboard />
              : <Navigate to="/login" replace />
            }
          />
        <Route
            path="/settings"
            element={ token
              ? <ProfileSettings />
              : <Navigate to="/login" replace />
            }
          />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
