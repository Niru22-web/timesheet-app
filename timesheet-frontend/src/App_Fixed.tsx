import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import Layout from './components/Layout';
import FrozenLayout from './components/FrozenLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/NewAdminDashboard';
import ManagerDashboard from './pages/NewManagerDashboard';
import PartnerDashboard from './pages/NewPartnerDashboard';
import EmployeeDashboard from './pages/NewEmployeeDashboard';
import TestComponent from './pages/TestComponent';
import Timesheet from './pages/Timesheet';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Reimbursement from './pages/Reimbursement';
import Clients from './pages/Clients';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import SimpleLogin from './pages/SimpleLogin';
import UserRegistration from './pages/UserRegistration';
import EmployeeRegistration from './pages/EmployeeRegistration';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    console.log('PrivateRoute - isAuthenticated:', isAuthenticated);
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
    return (
        <LoadingProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<SimpleLogin />} />
                        <Route path="/register" element={<UserRegistration />} />
                        <Route path="/complete-registration" element={<EmployeeRegistration />} />

                        {/* Dashboard Routes - Use new dashboard components directly */}
                        <Route path="/admin" element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
                        <Route path="/manager" element={<ErrorBoundary><ManagerDashboard /></ErrorBoundary>} />
                        <Route path="/partner" element={<ErrorBoundary><PartnerDashboard /></ErrorBoundary>} />
                        <Route path="/employee" element={<ErrorBoundary><EmployeeDashboard /></ErrorBoundary>} />

                        {/* Protected Routes with Frozen Layout */}
                        <Route path="/" element={
                            <PrivateRoute>
                                <FrozenLayout>
                                    <ErrorBoundary>
                                        <Routes>
                                            <Route index element={<Dashboard />} />
                                            <Route path="timesheet" element={<Timesheet />} />
                                            <Route path="employees" element={<Employees />} />
                                            <Route path="projects" element={<Projects />} />
                                            <Route path="reports" element={<Reports />} />
                                            <Route path="clients" element={<Clients />} />
                                            <Route path="jobs" element={<Jobs />} />
                                            <Route path="profile" element={<Profile />} />
                                            <Route path="admin-panel" element={<Admin />} />
                                            <Route path="reimbursement" element={<Reimbursement />} />
                                        </Routes>
                                    </ErrorBoundary>
                                </FrozenLayout>
                            </PrivateRoute>
                        } />

                        {/* Catch-all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </LoadingProvider>
    );
};

export default App;
