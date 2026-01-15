import { useState } from 'react';
import './FormInput.css';

const FormInput = ({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    success,
    icon,
    required = false,
    disabled = false,
    helpText,
    validate,
    ...props
}) => {
    const [focused, setFocused] = useState(false);
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleBlur = (e) => {
        setFocused(false);
        setTouched(true);

        if (validate) {
            const validationError = validate(e.target.value);
            setLocalError(validationError || '');
        }
    };

    const handleChange = (e) => {
        onChange(e);

        if (touched && validate) {
            const validationError = validate(e.target.value);
            setLocalError(validationError || '');
        }
    };

    const displayError = error || localError;
    const showSuccess = success && !displayError && touched && value;

    return (
        <div className={`form-input-wrapper ${focused ? 'focused' : ''} ${displayError ? 'has-error' : ''} ${showSuccess ? 'has-success' : ''}`}>
            {label && (
                <label htmlFor={name} className="form-input-label">
                    {label}
                    {required && <span className="required-star">*</span>}
                </label>
            )}

            <div className="form-input-container">
                {icon && <span className="form-input-icon">{icon}</span>}

                <input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setFocused(true)}
                    onBlur={handleBlur}
                    disabled={disabled}
                    className={`form-input ${icon ? 'has-icon' : ''}`}
                    aria-invalid={!!displayError}
                    aria-describedby={displayError ? `${name}-error` : undefined}
                    {...props}
                />

                {/* Status icons */}
                {displayError && (
                    <span className="form-input-status error">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    </span>
                )}
                {showSuccess && (
                    <span className="form-input-status success">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </span>
                )}
            </div>

            {/* Error message with animation */}
            {displayError && (
                <span id={`${name}-error`} className="form-input-error" role="alert">
                    {displayError}
                </span>
            )}

            {/* Help text */}
            {helpText && !displayError && (
                <span className="form-input-help">{helpText}</span>
            )}
        </div>
    );
};

// Common validators
export const validators = {
    email: (value) => {
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email';
        return '';
    },

    password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must have an uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must have a number';
        return '';
    },

    required: (fieldName) => (value) => {
        if (!value || !value.trim()) return `${fieldName} is required`;
        return '';
    },

    phone: (value) => {
        if (!value) return 'Phone number is required';
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value.replace(/\D/g, ''))) return 'Enter a valid 10-digit phone number';
        return '';
    },

    minLength: (min) => (value) => {
        if (value && value.length < min) return `Must be at least ${min} characters`;
        return '';
    }
};

export default FormInput;
