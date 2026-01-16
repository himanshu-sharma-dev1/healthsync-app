import { useState, useEffect } from 'react';
import './AccessibilityPanel.css';

const AccessibilityPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [fontSize, setFontSize] = useState('medium'); // 'small', 'medium', 'large'
    const [highContrast, setHighContrast] = useState(false);

    // Apply accessibility settings
    useEffect(() => {
        const root = document.documentElement;

        // Font size - apply to root for global effect
        const fontSizes = {
            small: '14px',
            medium: '16px',
            large: '20px'
        };
        root.style.fontSize = fontSizes[fontSize];
        root.style.setProperty('--base-font-size', fontSizes[fontSize]);

        // High contrast
        if (highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Save preferences
        localStorage.setItem('accessibility', JSON.stringify({ fontSize, highContrast }));
    }, [fontSize, highContrast]);

    // Load saved preferences
    useEffect(() => {
        const saved = localStorage.getItem('accessibility');
        if (saved) {
            const { fontSize: savedSize, highContrast: savedContrast } = JSON.parse(saved);
            if (savedSize) setFontSize(savedSize);
            if (savedContrast !== undefined) setHighContrast(savedContrast);
        }
    }, []);

    return (
        <>
            {/* Accessibility Toggle Button */}
            <button
                className="accessibility-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Accessibility settings"
                title="Accessibility settings"
            >
                ♿
            </button>

            {/* Accessibility Panel */}
            {isOpen && (
                <div className="accessibility-panel" role="dialog" aria-label="Accessibility Options">
                    <div className="panel-header">
                        <h3>♿ Accessibility</h3>
                        <button
                            className="close-btn"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    <div className="panel-content">
                        {/* Font Size */}
                        <div className="option-group">
                            <label>Font Size</label>
                            <div className="font-size-options">
                                <button
                                    className={`size-btn ${fontSize === 'small' ? 'active' : ''}`}
                                    onClick={() => setFontSize('small')}
                                    aria-pressed={fontSize === 'small'}
                                >
                                    A
                                </button>
                                <button
                                    className={`size-btn ${fontSize === 'medium' ? 'active' : ''}`}
                                    onClick={() => setFontSize('medium')}
                                    aria-pressed={fontSize === 'medium'}
                                >
                                    A
                                </button>
                                <button
                                    className={`size-btn ${fontSize === 'large' ? 'active' : ''}`}
                                    onClick={() => setFontSize('large')}
                                    aria-pressed={fontSize === 'large'}
                                >
                                    A
                                </button>
                            </div>
                        </div>

                        {/* High Contrast */}
                        <div className="option-group">
                            <label htmlFor="high-contrast-toggle">High Contrast</label>
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    id="high-contrast-toggle"
                                    checked={highContrast}
                                    onChange={(e) => setHighContrast(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </div>
                        </div>

                        {/* Reset */}
                        <button
                            className="reset-btn"
                            onClick={() => {
                                setFontSize('medium');
                                setHighContrast(false);
                            }}
                        >
                            Reset to Default
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AccessibilityPanel;
