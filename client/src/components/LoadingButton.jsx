import './LoadingButton.css';

const LoadingButton = ({
    children,
    loading = false,
    disabled = false,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    icon,
    onClick,
    type = 'button',
    ...props
}) => {
    const classNames = [
        'loading-btn',
        `loading-btn-${variant}`,
        `loading-btn-${size}`,
        fullWidth && 'loading-btn-full',
        loading && 'loading-btn-loading',
        disabled && 'loading-btn-disabled'
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classNames}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span className="loading-btn-spinner">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                    </svg>
                </span>
            )}
            {icon && !loading && <span className="loading-btn-icon">{icon}</span>}
            <span className="loading-btn-text">{children}</span>
        </button>
    );
};

export default LoadingButton;
