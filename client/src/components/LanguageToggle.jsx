import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle = () => {
    const { language, changeLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
    ];

    const currentLang = languages.find(l => l.code === language);

    return (
        <div className="language-toggle">
            <button
                className="lang-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Change language"
            >
                <span className="lang-flag">{currentLang?.flag}</span>
                <span className="lang-code">{language.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className="lang-dropdown">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            className={`lang-option ${language === lang.code ? 'active' : ''}`}
                            onClick={() => {
                                changeLanguage(lang.code);
                                setIsOpen(false);
                            }}
                        >
                            <span className="lang-flag">{lang.flag}</span>
                            <span className="lang-name">{lang.name}</span>
                            {language === lang.code && <span className="check">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageToggle;
