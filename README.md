# useL10n
## A small library for localizing a static website on the client

### Features

* Store translations as json files (one per language).
* User preferred language choice saved in localStorage.
* Fetched translations are cached in SessionStorage.

### Default config

```js
{
  filesPath = './l10n/', // => fetch('./l10n/{language}.json')
  dataAttrName = 'data-l10n-key', // i.e. <p data-l10n-key="...">
  localStorageKeyName = 'language', // i.e. {language: 'xx'}
  sessionCacheKeyPrefix = 'l10n', // i.e. {l10n-es: JSON.encode(dictionary)}
  rootElement = document.documentElement, // <html>
  missingTranslationText = 'MISSING_TRANSLATION',
  defaultLanguage = navigator.language?.split('-')[0],
}
```

### Usage

```html
  <html lang="en">

  <p data-l10n-key="hello-msg">Hello World!</p>

  <script type="module">
    import { useL10n } from ".../use-l10n.js";

    const [getUILanguage, getPreferredLanguage, setLanguage] = useL10n();

    getUILanguage() === 'en'; // true
    setLanguage('es');
    /*
     1. Fetches './l10n/es.json'
     2. Translates UI => Will search value for key 'hello-msg' in es.json
     3. Updates `rootElement` with correct `lang` attribute
    */
    document.querySelector('p').innerText === 'Hola Mundo!'; // true
    document.querySelector('html').lang === 'es'; // true

  </script>
```


### Changelog:

  * v1.x  (branch v1)
    - [x] Handle simple text translations based on language.
    - [ ] Handle localization for dates, punctuation, currency, etc.
    - [ ] Handle plurals / dinamic content.
