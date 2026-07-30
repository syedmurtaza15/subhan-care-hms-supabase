import { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import './ConfirmDialog.css';

/**
 * ConfirmDialog - imperative confirmation prompt.
 * Usage:
 *   const [pendingDelete, setPendingDelete] = useState(null);
 *   <ConfirmDialog
 *     isOpen={Boolean(pendingDelete)}
 *     title="Delete patient?"
 *     body={<>You're about to delete <strong>{pendingDelete?.name}</strong>...</>}
 *     confirmLabel="Delete"
 *     variant="danger"
 *     onConfirm={async () => { await api.delete(pendingDelete.id); }}
 *     onClose={() => setPendingDelete(null)}
 *   />
 */
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  body = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  busy = false,
}) => {
  const [internalBusy, setInternalBusy] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) {
      onClose?.();
      return;
    }
    try {
      setInternalBusy(true);
      await onConfirm();
    } finally {
      setInternalBusy(false);
      onClose?.();
    }
  };

  const isBusy = busy || internalBusy;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isBusy ? undefined : onClose}
      size="sm"
      title={title}
      closeOnOverlayClick={!isBusy}
      closeOnEsc={!isBusy}
    >
      <div className="confirm-dialog__body">
        <div className={`confirm-dialog__icon confirm-dialog__icon--${variant}`} aria-hidden="true">
          !
        </div>
        <div className="confirm-dialog__text">{body}</div>
      </div>
      <div className="confirm-dialog__actions">
        <Button variant="outline" onClick={onClose} disabled={isBusy}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={handleConfirm}
          isLoading={isBusy}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;