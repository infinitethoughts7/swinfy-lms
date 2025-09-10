'use client';

import React, { createContext, useContext, useState } from 'react';

interface ModalContextType {
  isRegistrationModalOpen: boolean;
  isLoginModalOpen: boolean;
  openRegistrationModal: () => void;
  closeRegistrationModal: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openRegistrationModal = () => {
    setIsLoginModalOpen(false);
    setIsRegistrationModalOpen(true);
  };
  
  const closeRegistrationModal = () => setIsRegistrationModalOpen(false);

  const openLoginModal = () => {
    setIsRegistrationModalOpen(false);
    setIsLoginModalOpen(true);
  };
  
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const switchToLogin = () => {
    setIsRegistrationModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegistrationModalOpen(true);
  };

  return (
    <ModalContext.Provider
      value={{
        isRegistrationModalOpen,
        isLoginModalOpen,
        openRegistrationModal,
        closeRegistrationModal,
        openLoginModal,
        closeLoginModal,
        switchToLogin,
        switchToRegister,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
