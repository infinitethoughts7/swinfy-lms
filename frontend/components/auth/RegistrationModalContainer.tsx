'use client';

import { useModal } from '@/components/providers/ModalProvider';
import RegistrationModal from './RegistrationModal';

export default function RegistrationModalContainer() {
  const { isRegistrationModalOpen, closeRegistrationModal, switchToLogin, openLoginModal } = useModal();

  const handleRegistrationComplete = () => {
    // Automatically open login modal after registration is complete
    setTimeout(() => {
      openLoginModal();
    }, 500); // Small delay for smooth transition
  };

  return (
    <RegistrationModal 
      open={isRegistrationModalOpen} 
      onOpenChange={(open) => !open && closeRegistrationModal()}
      onSwitchToLogin={switchToLogin}
      onRegistrationComplete={handleRegistrationComplete}
    />
  );
}
