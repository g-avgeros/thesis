import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Calendar from './pages/Calendar';
import ProfileSettings from './pages/ProfileSettings';
import Services from './pages/Services';
import Clients from './pages/Clients';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/services" element={<Services />} />
        <Route path="/clients" element={<Clients />} />
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
