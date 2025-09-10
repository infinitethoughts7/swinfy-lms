'use client';

import { useModal } from '@/components/providers/ModalProvider';
import RegistrationModal from './RegistrationModal';

export default function RegistrationModalContainer() {
  const { isRegistrationModalOpen, closeRegistrationModal, switchToLogin } = useModal();

  return (
    <RegistrationModal 
      open={isRegistrationModalOpen} 
      onOpenChange={(open) => !open && closeRegistrationModal()}
      onSwitchToLogin={switchToLogin}
    />
  );
}
