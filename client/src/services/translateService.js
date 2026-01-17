/**
 * Lingva Translate Service
 * Open source Google Translate frontend - FREE API
 * Docs: https://github.com/thedaviddelta/lingva-translate
 */

// Public Lingva instances (fallback chain)
const LINGVA_INSTANCES = [
    'https://lingva.ml',
    'https://translate.plausibility.cloud',
    'https://lingva.garuber.eu'
];

let currentInstance = 0;

/**
 * Translate text using Lingva Translate API
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language code (e.g., 'en')
 * @param {string} targetLang - Target language code (e.g., 'hi')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, sourceLang = 'en', targetLang = 'hi') => {
    if (!text || text.trim() === '') return text;
    if (sourceLang === targetLang) return text;

    // Try each instance until one works
    for (let i = 0; i < LINGVA_INSTANCES.length; i++) {
        const instance = LINGVA_INSTANCES[(currentInstance + i) % LINGVA_INSTANCES.length];

        try {
            const encodedText = encodeURIComponent(text);
            const url = `${instance}/api/v1/${sourceLang}/${targetLang}/${encodedText}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) continue;

            const data = await response.json();

            if (data.translation) {
                // Update preferred instance
                currentInstance = (currentInstance + i) % LINGVA_INSTANCES.length;
                return data.translation;
            }
        } catch (error) {
            console.warn(`Lingva instance ${instance} failed:`, error.message);
            continue;
        }
    }

    // All instances failed, return original text
    console.error('All Lingva instances failed, returning original text');
    return text;
};

/**
 * Translate multiple texts in batch
 * @param {string[]} texts - Array of texts to translate
 * @param {string} sourceLang - Source language code
 * @param {string} targetLang - Target language code
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const translateBatch = async (texts, sourceLang = 'en', targetLang = 'hi') => {
    const translations = await Promise.all(
        texts.map(text => translateText(text, sourceLang, targetLang))
    );
    return translations;
};

/**
 * Get supported languages from Lingva
 * @returns {Promise<Array>} - Array of supported languages
 */
export const getSupportedLanguages = async () => {
    try {
        const response = await fetch(`${LINGVA_INSTANCES[currentInstance]}/api/v1/languages`);
        const data = await response.json();
        return data.languages || [];
    } catch (error) {
        console.error('Failed to fetch languages:', error);
        return [
            { code: 'en', name: 'English' },
            { code: 'hi', name: 'Hindi' },
            { code: 'es', name: 'Spanish' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' }
        ];
    }
};

export default {
    translateText,
    translateBatch,
    getSupportedLanguages
};
