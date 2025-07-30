import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/login/index';
import Signup from './pages/signup/index';
import Dashboard from './pages/dashboard/index';
import Home from './pages/home/index.jsx';

function App() {
  return (
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/signup" element={<Signup/>} />
        </Routes>
      </Router>
  );
}

export default App;