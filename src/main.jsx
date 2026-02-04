import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { PostsProvider } from './context/PostsContext';
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ModalProvider>
          <PostsProvider>
            <App />
          </PostsProvider>
        </ModalProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);