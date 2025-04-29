import { useCallback, useEffect } from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  modalRef, 
  contentVisible, 
  isClosing 
}) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, handleEscape]);

  return (
    <div
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-modal="true"
      role="dialog"
      aria-label="Project Details"
    >
      <div
        ref={modalRef}
        className="modal-card"
      >
        <div className={`modal-inner ${contentVisible ? 'visible' : ''}`}>
          <button
            className={`modal-close ${contentVisible ? 'visible' : ''}`}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
          {children}
        </div>
      </div>
    </div>
  );
} 