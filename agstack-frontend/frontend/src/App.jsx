import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, CssBaseline } from '@mui/material';
import ConnectionsPage from './pages/ConnectionsPage';
import ChatPage from './pages/ChatPage';
import Toast from './components/common/Toast';
import Layout from './components/layout/Layout';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '8px',
              background: '#FFF',
              color: '#333',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            success: {
              icon: '🎉',
              style: {
                border: '1px solid #E6F7EA',
                backgroundColor: '#F3FAF5',
              },
            },
            error: {
              icon: '❌',
              style: {
                border: '1px solid #FDE8E8',
                backgroundColor: '#FEF2F2',
              },
            },
          }}
        />
        <Toast />
        <Layout>
          <Routes>
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
