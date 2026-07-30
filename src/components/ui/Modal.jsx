import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import './Modal.css';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  footer,
  hideCloseButton = false,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
}) => {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && closeOnEsc) {
        event.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    // Move focus into the dialog for accessibility
    if (dialogRef.current) {
      const focusable = dialogRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable) {
        setTimeout(() => focusable.focus(), 60);
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleOverlayClick = (event) => {
    if (!closeOnOverlayClick) return;
    if (event.target === overlayRef.current) onClose?.();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="ui-modal__overlay"
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'ui-modal-title' : undefined}
        className={classNames('ui-modal', `ui-modal--${size}`, className)}
      >
        {(title || subtitle || !hideCloseButton) && (
          <header className="ui-modal__header">
            <div>
              {title && (
                <h2 id="ui-modal-title" className="ui-modal__title">
                  {title}
                </h2>
              )}
              {subtitle && <p className="ui-modal__subtitle">{subtitle}</p>}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                className="ui-modal__close"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            )}
          </header>
        )}
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;