
const useI18nDefaultProps = {
  filesPath: 'i18n/', // Lookup => i18n/{language}.json (relative)
  dataAttrName: 'data-i18n-key',
  localStorageKeyName: 'language', // i.e. 'es', 'en'
  sessionCacheKeyPrefix: 'i18n', // i18n-{language}
  rootElement: document.documentElement,
  missingTranslationText: 'MISSING_TRANSLATION',
  fallbackLanguage: undefined, // Will be set to initial UI language if undefined
};

export function useI18n(props) {
  const config = { ...useI18nDefaultProps, ...props }

  const { getLocalLanguage, cacheUITranslations,
    getUILanguage, translateInto, setLocalLanguage } = setupWith(config);

  cacheUITranslations();  // Prevent fetching initial UI language later on

  if (!config.fallbackLanguage) config.fallbackLanguage = getUILanguage(); // Initial UI language

  if (!getLocalLanguage()) setLocalLanguage(getUILanguage());  // sync local storage language with UI language

  return [getLocalLanguage, translateInto];
}


function setupWith(config) {
  checkConfig();

  const getUILanguage = () => config.rootElement.lang?.split('-')[0] || 'default';
  const getLocalLanguage = () => localStorage.getItem(config.localStorageKeyName);
  const setLocalLanguage = (lang) => localStorage.setItem(config.localStorageKeyName, lang);

  function getSessionCache(language) {
    return JSON.parse(sessionStorage.getItem(`${config.sessionCacheKeyPrefix}-${language}`));
  }

  function setSessionCache(language, data) {
    sessionStorage.setItem(`${config.sessionCacheKeyPrefix}-${language}`, JSON.stringify(data));
  }

  function cacheUITranslations() {
    const dictionary = {};
    for (const element of config.rootElement.querySelectorAll(`[${config.dataAttrName}]`)) {
      dictionary[element.getAttribute(config.dataAttrName)] = element.innerText.trim();
    }
    setSessionCache(getUILanguage(), dictionary);
  }

  async function getTranslations(language) {
    let dictionary = getSessionCache(language);

    if (!dictionary) {
      const baseUrl = new URL(config.filesPath, document.location);
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
    translation = (await getTranslations(config.fallbackLanguage))[key];
    if (translation) return translation;

    return config.missingTranslationText;
  }

  async function translateInto(language) {
    if (language === getLocalLanguage()) {
      console.info(`Omitting translating into current langauge "${language}".`);
      return;
    }

    // Find and translate all DOM elements below config.rootElement
    for (const element of config.rootElement.querySelectorAll(`[${config.dataAttrName}]`)) {
      const key = element.getAttribute(config.dataAttrName);
      element.innerText = await getTranslation(language, key);
    }

    // Keep UI and LocalStorage in sync
    config.rootElement.setAttribute('lang', language);
    setLocalLanguage(language);
  }

  // CHECKS
  function checkConfig() {
    if (!config.filesPath.endsWith('/')) {
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
