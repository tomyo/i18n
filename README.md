# useL10n
## A small library for localizing a static website on the client

### Features

* Store translations as json files (one per language).
* Preferred language saved in localStorage.
* Fetched translations are cached in SessionStorage.
* Initial html content cached as default language (using `lang` attribute as language).
  - This avoids having the default language as a json file.
  - See known issues below when doing this (👁 line breaks in markup).


### Usage

```html
  <html lang="en">

  <p data-l10n-key="hello-msg">Hello World!</p>

  <script type="module">
    import { useL10n } from ".../use-l10n.js";

    const [getUILanguage, getPreferredLanguage, setLanguage] = useL10n(/* config here */);

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

### Default config

You can override this providing an object with the new options: `useL10n({config-override})`.

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

### Known issues

  * When saving presented HTML content as default language in session storage, 
    [as per specs](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/innerText#value),
    calling `innerText` on not-visible nodes will behave as calling `textContent`. 
    This can produce unwanted line breaks in the stored json, affecting the default language when switching to it again during a session.
    As a work around, if using the HTML as source of truth for the default language, make sure the markup line breaks match the visually intended ones.

### Changelog:

  * v1.x  (branch v1)
    - [x] Handle simple text translations based on language.
    - [ ] Handle localization for dates, punctuation, currency, etc.
    - [ ] Handle plurals / dinamic content.

