/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState("");

  const openLoginModal = (message = "") => {
    setLoginModalMessage(message);
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginModalMessage("");
  };

  const value = {
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    loginModalMessage
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

export default ModalContext;