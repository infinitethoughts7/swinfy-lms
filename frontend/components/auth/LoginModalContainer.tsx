'use client';

import { useModal } from '@/components/providers/ModalProvider';
import LoginModal from './LoginModal';

export default function LoginModalContainer() {
  const { isLoginModalOpen, closeLoginModal, switchToRegister } = useModal();

  return (
    <LoginModal
      isOpen={isLoginModalOpen}
      onClose={closeLoginModal}
      onSwitchToRegister={switchToRegister}
    />
  );
}
