import './Skeleton.css';

// Basic skeleton shapes
export const SkeletonText = ({ width = '100%', lines = 1 }) => (
    <div className="skeleton-wrapper">
        {Array.from({ length: lines }).map((_, i) => (
            <div
                key={i}
                className="skeleton skeleton-text"
                style={{ width: i === lines - 1 && lines > 1 ? '70%' : width }}
            />
        ))}
    </div>
);

export const SkeletonAvatar = ({ size = 50 }) => (
    <div
        className="skeleton skeleton-avatar"
        style={{ width: size, height: size }}
    />
);

export const SkeletonCard = ({ height = 200 }) => (
    <div className="skeleton skeleton-card" style={{ height }} />
);

export const SkeletonButton = ({ width = 120 }) => (
    <div className="skeleton skeleton-button" style={{ width }} />
);

// Doctor Card Skeleton
export const DoctorCardSkeleton = () => (
    <div className="doctor-card-skeleton">
        <div className="skeleton-header">
            <SkeletonAvatar size={80} />
            <div className="skeleton-info">
                <SkeletonText width="60%" />
                <SkeletonText width="40%" />
            </div>
        </div>
        <div className="skeleton-stats">
            <SkeletonText width="30%" />
            <SkeletonText width="30%" />
        </div>
        <div className="skeleton-footer">
            <SkeletonText width="50%" />
            <SkeletonButton />
        </div>
    </div>
);

// Appointment Card Skeleton
export const AppointmentCardSkeleton = () => (
    <div className="appointment-card-skeleton">
        <div className="skeleton-header">
            <SkeletonAvatar size={60} />
            <div className="skeleton-info">
                <SkeletonText width="70%" />
                <SkeletonText width="50%" />
            </div>
        </div>
        <div className="skeleton-body">
            <SkeletonText width="80%" />
            <SkeletonText width="60%" />
        </div>
        <SkeletonButton width={100} />
    </div>
);

// Page Loading Skeleton
export const PageLoadingSkeleton = () => (
    <div className="page-loading-skeleton">
        <div className="loading-spinner-container">
            <div className="loading-spinner" />
            <p>Loading...</p>
        </div>
    </div>
);

// Doctors Grid Skeleton
export const DoctorsGridSkeleton = ({ count = 6 }) => (
    <div className="doctors-grid-skeleton">
        {Array.from({ length: count }).map((_, i) => (
            <DoctorCardSkeleton key={i} />
        ))}
    </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
    <div className="table-skeleton">
        <div className="table-skeleton-header">
            {Array.from({ length: columns }).map((_, i) => (
                <SkeletonText key={i} width="80%" />
            ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="table-skeleton-row">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <SkeletonText key={colIndex} width={colIndex === 0 ? "60%" : "40%"} />
                ))}
            </div>
        ))}
    </div>
);

export default {
    SkeletonText,
    SkeletonAvatar,
    SkeletonCard,
    SkeletonButton,
    DoctorCardSkeleton,
    AppointmentCardSkeleton,
    PageLoadingSkeleton,
    DoctorsGridSkeleton,
    TableSkeleton
};
