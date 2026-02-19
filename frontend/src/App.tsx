import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import { SignupPage } from './modules/auth/SignupPage';
import { LoginPage } from './modules/auth/LoginPage';
import { AuthProvider } from './hooks/useAuth';
import { AppLayout } from './components/AppLayout';

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
              <Route path="/" element={ <div>Home</div>} />
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
