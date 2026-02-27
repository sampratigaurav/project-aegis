import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ModelUpload from './pages/dashboard/ModelUpload';
import Verification from './pages/dashboard/Verification';
import Marketplace from './pages/dashboard/Marketplace';

function App() {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AuthProvider>
                    <div className="min-h-screen bg-aegis-bg text-white font-sans selection:bg-aegis-accent selection:text-black">
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />

                            {/* Dashboard Routes Protected by Auth */}
                            <Route path="/dashboard" element={<ProtectedRoute />}>
                                <Route element={<Dashboard />}>
                                    <Route index element={<ModelUpload />} />
                                    <Route path="verify" element={<Verification />} />
                                    <Route path="marketplace" element={<Marketplace />} />
                                </Route>
                            </Route>
                        </Routes>
                    </div>
                </AuthProvider>
            </ToastProvider>
        </ErrorBoundary>
    );
}

export default App;
