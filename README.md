# useL10n
## A library for localizing simple websites

### Features

* Store translations as json files (one per language).
* LocalStorage for saving user preferred language.
* SessionStorage for caching translations.
* Fallback language for missing keys when translating.

### Usage

```html
  <html lang="en">

  <p data-l10n-key="hello-msg">Hello World!</p>

  <script type="module">
    import { useL10n } from ".../use-l10n.js";

    const [getLocale, setLocale] = useL10n();

    getLocale() === 'en'; // true
    setLocale('es');
    /*
     1. Fetches './l10n/es.json'
     2. Translates UI => Will search value for key 'hello-msg' in es.json
     3. Updates root element with correct lang= attribute
    */
    document.querySelector('p').innerText === 'Hola Mundo!'; // true
    document.querySelector('html').lang === 'es'; // true

  </script>
```


TODO:
 - [x] Handle simple text translations.
 - [ ] Handle plurals / dinamic content.
 - [ ] Handle localization for dates, punctuiation, currency, etc.
