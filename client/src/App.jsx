import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyGames from './pages/MyGames';
import Loans from './pages/Loans';
import Navbar from './components/Navbar';
import OverdueModal from './components/OverdueModal';
import { useEffect, useState } from 'react';
import api from './api';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();
  const [overdueLoans, setOverdueLoans] = useState([]);

  useEffect(() => {
    if (user) {
      checkOverdue();
    }
  }, [user]);

  const checkOverdue = async () => {
    try {
      const res = await api.get('/loans/borrowed');
      const loans = res.data;
      const now = new Date();
      // Reset time to start of day for fair comparison or keep distinct?
      // "0 days left" means due today. If due date is past, IT IS OVERDUE.
      // Logic: if return_date < now. 
      // Actually, if I lend for 1 day at 10am, and check at 11am tomorrow.
      // Let's use simple timestamp comparison.

      const overdue = loans.filter(l => {
        if (l.status !== 'active' || !l.return_date) return false;
        const due = new Date(l.return_date);
        // If due date is BEFORE now, it is overdue.
        // But usually "0 days left" implies "Due today".
        // Let's say if (now > due) it's overdue.
        // However, we want to flag it "Day 0" as well? User said "when 0 days left".
        // "0 days left" usually means due date is in the future but less than 24h.
        // User text: "when le queden 0 dias le salga un aviso".
        // So if days remaining <= 0.

        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 0;
      });
      setOverdueLoans(overdue);
    } catch (error) {
      console.error("Failed to check loans", error);
    }
  };

  return (
    <>
      <Navbar />
      <OverdueModal overdueLoans={overdueLoans} />
      <main className="container mx-auto px-4 py-8 mb-20 min-h-[calc(100vh-200px)]">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/my-games" element={<PrivateRoute><MyGames /></PrivateRoute>} />
          <Route path="/loans" element={<PrivateRoute><Loans /></PrivateRoute>} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
