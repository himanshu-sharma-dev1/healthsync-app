import { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    showCloseButton = true,
    closeOnOverlayClick = true,
    footer
}) => {
    const modalRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div
                ref={modalRef}
                className={`modal modal-${size}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                tabIndex={-1}
            >
                {/* Header */}
                <div className="modal-header">
                    {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
                    {showCloseButton && (
                        <button
                            className="modal-close"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="modal-body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
