import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import { SignupPage } from './modules/auth/SignupPage';
import { LoginPage } from './modules/auth/LoginPage';
import { AuthProvider } from './hooks/useAuth';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EventListPage } from './modules/events/EventListPage';
import { EventDetailPage } from './modules/events/components/EventDetailPage';

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <ErrorBoundary>
        <AuthProvider>
          <AntApp>
            <BrowserRouter>
              <Toaster position="top-right" />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route element={<AppLayout />}>
                  <Route path="/" element={<Navigate to="/events" replace />} />
                  <Route path="/events" element={<EventListPage />} />
                  <Route path="/events/new" element={
                    <ProtectedRoute><EventListPage /></ProtectedRoute>
                  } />
                  <Route path="/events/:id/edit" element={
                    <ProtectedRoute><EventDetailPage /></ProtectedRoute>
                  } />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AntApp>
        </AuthProvider>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
