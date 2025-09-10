'use client';

import { useModal } from '@/components/providers/ModalProvider';
import RegistrationModal from './RegistrationModal';

export default function RegistrationModalContainer() {
  const { isRegistrationModalOpen, closeRegistrationModal } = useModal();

  return (
    <RegistrationModal 
      open={isRegistrationModalOpen} 
      onOpenChange={closeRegistrationModal} 
    />
  );
}
