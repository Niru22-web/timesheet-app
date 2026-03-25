import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import FrozenLayout from './components/FrozenLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Dashboard from './pages/NewEmployeeDashboard';
import AdminDashboard from './pages/NewAdminDashboard';
import ManagerDashboard from './pages/NewManagerDashboard';
import PartnerDashboard from './pages/NewPartnerDashboard';
import EmployeeDashboard from './pages/NewEmployeeDashboard';
import TestComponent from './pages/TestComponent';
import Timesheet from './pages/Timesheet';
import Employees from './pages/Employees';
import EditEmployee from './pages/EditEmployee';
import Projects from './pages/Projects';
import Reports from './pages/Reports';
import Admin from './pages/Admin';
import Reimbursement from './pages/Reimbursement';
import LeaveManagement from './pages/LeaveManagement';
import Clients from './pages/Clients';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import SimpleLogin from './pages/SimpleLogin';
import ModernLoginLayout from './components/layouts/ModernLoginLayout';
import Auth3DLayout from './components/layouts/Auth3DLayout';
import ForgotPassword3DLayout from './components/layouts/ForgotPassword3DLayout';
import MobileAuthLayout from './components/layouts/MobileAuthLayout';
import MobileForgotPasswordLayout from './components/layouts/MobileForgotPasswordLayout';
import ResponsiveAuthLayout from './components/layouts/ResponsiveAuthLayout';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserRegistration from './pages/UserRegistration';
import EmployeeRegistration from './pages/EmployeeRegistration';
import EmailConfiguration from './pages/EmailConfiguration';
import EmailTemplates from './pages/EmailTemplates';
import UserAccessControl from './pages/UserAccessControl';
import OAuthCallback from './pages/OAuthCallback';


const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <NotificationProvider>
                    <LoadingProvider>
                        <AuthProvider>
                            <PermissionsProvider>
                                <Router>
                                <Routes>
                                    {/* Default Route - Redirect to login */}
                                    <Route path="/" element={<Navigate to="/login" replace />} />

                                    {/* Public Routes */}
                                    <Route path="/login" element={<ResponsiveAuthLayout mode="login" />} />
                                    <Route path="/signup" element={<ResponsiveAuthLayout mode="signup" />} />
                                    <Route path="/forgot-password" element={<ResponsiveAuthLayout type="forgot" />} />
                                    <Route path="/reset-password" element={<ResetPassword />} />
                                    <Route path="/register" element={<UserRegistration />} />
                                    <Route path="/complete-registration" element={<EmployeeRegistration />} />
                                    <Route path="/oauth-callback" element={<OAuthCallback />} />

                                    {/* Dashboard Routes - Use DashboardLayout (handled internally) */}
                                    <Route path="/admin" element={
                                        <PrivateRoute>
                                            <ErrorBoundary><AdminDashboard /></ErrorBoundary>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/manager" element={
                                        <PrivateRoute>
                                            <ErrorBoundary><ManagerDashboard /></ErrorBoundary>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/partner" element={
                                        <PrivateRoute>
                                            <ErrorBoundary><PartnerDashboard /></ErrorBoundary>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/employee" element={
                                        <PrivateRoute>
                                            <ErrorBoundary><EmployeeDashboard /></ErrorBoundary>
                                        </PrivateRoute>
                                    } />

                                    {/* Protected Routes with Frozen Layout */}
                                    <Route path="/timesheet" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <Timesheet />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/employees" element={
                                        <PrivateRoute>
                                            <ProtectedRoute moduleName="employees">
                                                <FrozenLayout>
                                                    <ErrorBoundary>
                                                        <Employees />
                                                    </ErrorBoundary>
                                                </FrozenLayout>
                                            </ProtectedRoute>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/employees/edit/:id" element={
                                        <PrivateRoute>
                                            <ProtectedRoute moduleName="employees">
                                                <FrozenLayout>
                                                    <ErrorBoundary>
                                                        <EditEmployee />
                                                    </ErrorBoundary>
                                                </FrozenLayout>
                                            </ProtectedRoute>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/projects" element={
                                        <PrivateRoute>
                                            <ProtectedRoute moduleName="projects">
                                                <FrozenLayout>
                                                    <ErrorBoundary>
                                                        <Projects />
                                                    </ErrorBoundary>
                                                </FrozenLayout>
                                            </ProtectedRoute>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/reports" element={
                                        <PrivateRoute>
                                            <ProtectedRoute moduleName="reports">
                                                <FrozenLayout>
                                                    <ErrorBoundary>
                                                        <Reports />
                                                    </ErrorBoundary>
                                                </FrozenLayout>
                                            </ProtectedRoute>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/clients" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <Clients />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/jobs" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <Jobs />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/profile" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <Profile />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/admin-panel" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <Admin />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/reimbursement" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <Reimbursement />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/leave-management" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <LeaveManagement />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/email-configuration" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <EmailConfiguration />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/email-templates" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <EmailTemplates />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />
                                    <Route path="/admin/user-access" element={
                                        <PrivateRoute>
                                            <FrozenLayout>
                                                <ErrorBoundary>
                                                    <UserAccessControl />
                                                </ErrorBoundary>
                                            </FrozenLayout>
                                        </PrivateRoute>
                                    } />

                                    {/* Catch-all route */}
                                    <Route path="*" element={<Navigate to="/login" replace />} />
                                </Routes>
                            </Router>
                        </PermissionsProvider>
                    </AuthProvider>
                </LoadingProvider>
            </NotificationProvider>
        </ToastProvider>
    </ThemeProvider>
    );
};

export default App;
