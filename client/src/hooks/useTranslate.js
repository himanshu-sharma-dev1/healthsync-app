/**
 * useTranslate Hook
 * React hook for dynamic translation using Lingva Translate API
 */

import { useState, useEffect, useCallback } from 'react';
import { translateText } from '../services/translateService';
import { useLanguage } from '../context/LanguageContext';

/**
 * Hook for translating dynamic text (user-generated content)
 * Falls back to original text if translation fails
 * 
 * @example
 * const { translate, translatedText, isTranslating } = useTranslate();
 * 
 * // Translate on demand
 * const handleTranslate = () => translate('Hello world');
 * 
 * // Or use auto-translate
 * const { translatedText } = useTranslate('Hello world', true);
 */
export const useTranslate = (initialText = '', autoTranslate = false) => {
    const { language } = useLanguage();
    const [translatedText, setTranslatedText] = useState(initialText);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState(null);

    const translate = useCallback(async (text, targetLang = null) => {
        const target = targetLang || language;

        if (!text || target === 'en') {
            setTranslatedText(text);
            return text;
        }

        setIsTranslating(true);
        setError(null);

        try {
            const result = await translateText(text, 'en', target);
            setTranslatedText(result);
            return result;
        } catch (err) {
            setError(err.message);
            setTranslatedText(text); // Fallback to original
            return text;
        } finally {
            setIsTranslating(false);
        }
    }, [language]);

    // Auto-translate when language or initialText changes
    useEffect(() => {
        if (autoTranslate && initialText) {
            translate(initialText);
        }
    }, [autoTranslate, initialText, language, translate]);

    return {
        translate,
        translatedText,
        isTranslating,
        error,
        language
    };
};

/**
 * Translate component for inline translation
 * @example
 * <Translate text="Hello world" />
 */
export const Translate = ({ text, as: Component = 'span', className = '' }) => {
    const { translatedText, isTranslating } = useTranslate(text, true);

    return (
        <Component className={`${className} ${isTranslating ? 'translating' : ''}`}>
            {translatedText}
        </Component>
    );
};

export default useTranslate;
