const i18next = require('i18next')
const i18nextBackend = require('i18next-fs-backend')

const i18nextOptions = {
  backend: {
    loadPath: './locales/{{lng}}/{{ns}}.json',
    addPath: './locales/{{lng}}/{{ns}}.missing.json'
  },
  initImmediate: false,
  fallbackLng: 'en',
  saveMissing: true,
  saveMissingTo: 'current',
  jsonIndent: 2
}

i18next
  .use(i18nextBackend)
  .init(
    i18nextOptions,
    (err, t) => {
      if (err) return console.log('i18n: something went wrong loading', err)
    }
  )

i18next.on('languageChanged', (lng) => {
  console.log(`i18n: language changed to ${lng}`)
})

module.exports = i18next
