[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) ![GitHub](https://img.shields.io/github/license/b0bdN/prayer-times-menubar-app)

# <img src="./assets/Logo.png" alt="logo" width="50"> prayer-times-menubar-app

A menubar application for displaying the prayer times from your city.

![prayer-times screenshot - dark](./assets/screenshots/prayer-times-dark.png)
![prayer-times screenshot - light](./assets/screenshots/prayer-times-light.png)

## Features

- Actual times from any location
- Change the calculation method or custom the angles for Fajr and Isha prayers
- Create your own method by changing the times of the different prayers
- Show additional times like Imsak, Sunrise and Midnight
- Dark and Light mode. Follow by default the system.

#### Geolocation

You can enter your location in the settings panel, just enter: CITY, COUNTRY. <br>
You can use the full name of the country or just the alpha-2 code [ISO 3166](https://www.iso.org/obp/ui/#search/code/). <br>
When using the geolocation button, a request is made to [IPinfo.io API](https://ipinfo.io/) to be able to get the city and country of you location. An internet connection is required.

*This app use the Free plan from ipinfo.io, and can access up to 50k request/month.*

#### Keyboard shortcut

You can use the following shortcuts: <br>
<kbd>Ctrl or Cmd</kbd> + <kbd>Alt</kbd> + <kbd>P</kbd>  Global shortcut to show/hide the app

## Development

- You will need a **TOKEN** from [IPinfo.io](https://ipinfo.io/).
```js
config.js

const TOKEN = 'your.token'
exports.TOKEN = TOKEN

---
main.js

function geolocation () {
  console.log('Fetch geolocation via IPinfo.io.')
  // NOTE: Enter your TOKEN from IPinfo.io
  const TOKEN = config.TOKEN

  fetch(`https://ipinfo.io/json?token=${TOKEN}`)
    .then(res => res.json())
    .then(json => {
      // console.log(json.ip, json.city, json.country)
      store.setCityCountry(json.city, json.country)
    })
    .catch(err => console.log(err))
}
```

- [node-fetch](https://github.com/node-fetch/node-fetch/tree/2.x#readme) v2.x is used because the ES Modules are not in use in this app.

## Contributing

Contributions are welcomed!

## Translations

- English

## Credit | Dependencies

- [Electronjs.org](https://www.electronjs.org/)
- [Menubar](https://github.com/maxogden/menubar)
- [electron-store](https://github.com/sindresorhus/electron-store)
- [node-fetch](https://github.com/node-fetch/node-fetch)
- [RESTful Prayer TImes API](https://aladhan.com/prayer-times-api) from [Aladhan.com](https://aladhan.com/)
- [IPinfo.io](https://ipinfo.io/)
- [Remix Icon](https://github.com/Remix-Design/RemixIcon)
- Logo: Islam by Olena Panasovska from NounProject.com

## Licence

[MIT](LICENSE)
