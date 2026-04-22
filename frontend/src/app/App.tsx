import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import LoginPage from './components/LoginPage';
import InterfaceV1 from './components/InterfaceV1';
import InterfaceV2 from './components/InterfaceV2';
import InterfaceV3 from './components/InterfaceV3';
import InterfaceV4 from './components/InterfaceV4';
import InterfaceV5 from './components/InterfaceV5';
import InterfaceV6 from './components/InterfaceV6';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/v1" element={<InterfaceV1 />} />
        <Route path="/v2" element={<InterfaceV2 />} />
        <Route path="/v3" element={<InterfaceV3 />} />
        <Route path="/v4" element={<InterfaceV4 />} />
        <Route path="/v5" element={<InterfaceV5 />} />
        <Route path="/v6" element={<InterfaceV6 />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
