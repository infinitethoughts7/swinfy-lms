'use client';

import { useModal } from '@/components/providers/ModalProvider';
import LoginModal from './LoginModal';

export default function LoginModalContainer() {
  const { isLoginModalOpen, closeLoginModal, switchToRegister } = useModal();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeLoginModal();
    }
  };

  return (
    <LoginModal
      open={isLoginModalOpen}
      onOpenChange={handleOpenChange}
      onSwitchToRegister={switchToRegister}
    />
  );
}
