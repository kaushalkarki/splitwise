// import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import SignUp from './pages/Signup'
import Login from './pages/Login';
import Group from './components/Group';
import AccountDetails from './components/AccountDetails';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Footer from './components/Footer';
import { UserProvider } from './context/UserContext';
import GroupCreation from './components/GroupCreation';
const App = () => {
  const location = useLocation();

  return (
    <>
      {/* Conditionally render Header based on the current path */}
      {location.pathname !== '/signup' && location.pathname !== '/login' && <Header />}
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/account-details"
          element={<ProtectedRoute element={<AccountDetails />} />}
        />
        <Route
          path="/create-group"
          element={<ProtectedRoute element={<GroupCreation />} />}
        />
        <Route
          path="/groups/:id"
          element={<ProtectedRoute element={<Group />} />}
        />
      </Routes>
      {location.pathname !== '/signup' && location.pathname !== '/login' && <Footer />}
    </>
  );
};

const Root = () => (
  <Router>
    <AuthProvider>
      <UserProvider>
      <App />
      </UserProvider>
    </AuthProvider>
  </Router>
);

export default Root;