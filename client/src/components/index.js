// UI Components Export
export { default as FormInput, validators } from './FormInput';
export { default as LoadingButton } from './LoadingButton';
export { default as Modal } from './Modal';
export {
    SkeletonText,
    SkeletonAvatar,
    SkeletonCard,
    SkeletonButton,
    DoctorCardSkeleton,
    AppointmentCardSkeleton,
    PageLoadingSkeleton,
    DoctorsGridSkeleton,
    TableSkeleton
} from './Skeleton';

// Badge Component
export const Badge = ({
    children,
    variant = 'default',
    size = 'medium',
    dot = false,
    pulse = false
}) => {
    const classNames = [
        'badge',
        `badge-${variant}`,
        `badge-${size}`,
        dot && 'badge-dot',
        pulse && 'badge-pulse'
    ].filter(Boolean).join(' ');

    return (
        <span className={classNames}>
            {dot && <span className="badge-dot-indicator" />}
            {children}
        </span>
    );
};

// Progress Bar Component
export const ProgressBar = ({
    value = 0,
    max = 100,
    variant = 'primary',
    showLabel = false,
    animated = true,
    size = 'medium'
}) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className={`progress-wrapper progress-${size}`}>
            <div className="progress-track">
                <div
                    className={`progress-fill progress-${variant} ${animated ? 'progress-animated' : ''}`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={max}
                />
            </div>
            {showLabel && (
                <span className="progress-label">{Math.round(percentage)}%</span>
            )}
        </div>
    );
};

// Avatar Component
export const Avatar = ({
    src,
    name,
    size = 40,
    status,
    className = ''
}) => {
    const initials = name
        ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <div
            className={`avatar ${status ? 'has-status' : ''} ${className}`}
            style={{ width: size, height: size }}
        >
            {src ? (
                <img src={src} alt={name || 'Avatar'} className="avatar-image" />
            ) : (
                <span className="avatar-initials">{initials}</span>
            )}
            {status && (
                <span className={`avatar-status avatar-status-${status}`} />
            )}
        </div>
    );
};

// Tooltip Component (simple CSS-based)
export const Tooltip = ({ children, content, position = 'top' }) => {
    return (
        <div className={`tooltip-wrapper tooltip-${position}`} data-tooltip={content}>
            {children}
        </div>
    );
};

// Empty State Component
export const EmptyState = ({
    icon = '📭',
    title,
    description,
    action
}) => (
    <div className="empty-state">
        <span className="empty-state-icon">{icon}</span>
        {title && <h3 className="empty-state-title">{title}</h3>}
        {description && <p className="empty-state-description">{description}</p>}
        {action && <div className="empty-state-action">{action}</div>}
    </div>
);
