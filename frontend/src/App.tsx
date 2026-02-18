import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<div className="flex min-h-screen items-center justify-center bg-gray-50"><h1 className="text-4xl font-bold text-gray-900">Event Planner</h1></div>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
