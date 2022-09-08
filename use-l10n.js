const getUIElementLanguage = (element) => element.lang?.split('-')[0] || 'default';

/**
 * 
 * @param {Config} config 
 * 
 * @typedef {Object} Config
 * @param {String} filesPath = 'l10n/'
 * @param {String} dataAttrName = 'data-l10n-key',
 * @param {String} localStorageKeyName = 'language', // i.e. 'es', 'en'
 * @param {String} sessionCacheKeyPrefix = 'l10n', // l10n-{language}
 * @param {String} rootElement = document.documentElement,
 * @param {String} missingTranslationText = 'MISSING_TRANSLATION',
 * @param {String} fallbackLanguage = rootElement.lang
 * @returns 
 */
export function useL10n(config = {}) {

  const { getLocalLanguage, cacheUITranslations,
    getUILanguage, translateInto, setLocalLanguage } = setupWith(config);

  cacheUITranslations();  // Prevent fetching initial UI language later on

  if (!getLocalLanguage()) setLocalLanguage(getUILanguage());  // sync local storage language with UI language

  return [getLocalLanguage, translateInto];
}


function setupWith({
  filesPath = './l10n/', // Lookup => ./l10n/{language}.json (relative)
  dataAttrName = 'data-l10n-key',
  localStorageKeyName = 'language', // i.e. 'es', 'en'
  sessionCacheKeyPrefix = 'l10n', // l10n-{language}
  rootElement = document.documentElement,
  missingTranslationText = 'MISSING_TRANSLATION',
  fallbackLanguage = getUIElementLanguage(rootElement),
} = {}) {
  validateConfig();

  const getUILanguage = () => getUIElementLanguage(rootElement);
  const getLocalLanguage = () => localStorage.getItem(localStorageKeyName);
  const setLocalLanguage = (lang) => localStorage.setItem(localStorageKeyName, lang);

  function getSessionCache(language) {
    return JSON.parse(sessionStorage.getItem(`${sessionCacheKeyPrefix}-${language}`));
  }

  function setSessionCache(language, data) {
    sessionStorage.setItem(`${sessionCacheKeyPrefix}-${language}`, JSON.stringify(data));
  }

  function cacheUITranslations() {
    const dictionary = {};
    for (const element of rootElement.querySelectorAll(`[${dataAttrName}]`)) {
      dictionary[element.getAttribute(dataAttrName)] = element.innerText.trim();
    }
    setSessionCache(getUILanguage(), dictionary);
  }

  async function getTranslations(language) {
    let dictionary = getSessionCache(language);

    if (!dictionary) {
      const baseUrl = new URL(filesPath, document.location);
      const url = new URL(`${language}.json`, baseUrl);
      const response = await fetch(url);
      dictionary = await response.json();

      setSessionCache(language, dictionary);
    }

    return dictionary;
  }

  async function getTranslation(language, key) {
    let translation = (await getTranslations(language))[key];
    if (translation) return translation;
    translation = (await getTranslations(fallbackLanguage))[key];
    if (translation) return translation;

    return missingTranslationText;
  }

  async function translateInto(language) {
    if (language === getLocalLanguage()) {
      console.info(`Omitting translating into current langauge "${language}".`);
      return;
    }

    // Find and translate all DOM elements below rootElement
    for (const element of rootElement.querySelectorAll(`[${dataAttrName}]`)) {
      const key = element.getAttribute(dataAttrName);
      element.innerText = await getTranslation(language, key);
    }

    // Keep UI and LocalStorage in sync
    rootElement.setAttribute('lang', language);
    setLocalLanguage(language);
  }

  // CHECKS
  function validateConfig() {
    if (!filesPath.endsWith('/')) {
      throw new Error('`filesPath` option must end with a forward slash /');
    }
  }

  return {
    getUILanguage,
    getLocalLanguage,
    cacheUITranslations,
    translateInto,
    setLocalLanguage,
  }
}
