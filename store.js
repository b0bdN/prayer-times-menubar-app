const Store = require('electron-store')

const store = new Store({ watch: true })

const setCityCountry = (city, country) => {
  store.set({
    city: city,
    country: country
  })
}

const getCityCountry = () => store.get('city') + ', ' + store.get('country')
const getCity = () => store.get('city')
const getCountry = () => store.get('country')

const setCalcMethod = (method) => store.set({ method: method })

const getCalcMethod = () => store.get('method')

const setCustomAngle = (fajr, isha) => {
  store.set({
    fajrAngle: fajr,
    ishaAngle: isha
  })
}

const getCustomFajrAngle = () => store.get('fajrAngle')
const getCustomIshaAngle = () => store.get('ishaAngle')

const setCheckImsak = (boolean) => store.set({ checkImsak: boolean })
const setCheckSunrise = (boolean) => store.set({ checkSunrise: boolean })
const setCheckMidnight = (boolean) => store.set({ checkMidnight: boolean })

const getCheckImsak = () => store.get('checkImsak')
const getCheckSunrise = () => store.get('checkSunrise')
const getCheckMidnight = () => store.get('checkMidnight')

const setTunes = (array) => {
  store.set({
    tunes: {
      imsak: array[0],
      fajr: array[1],
      sunrise: array[2],
      dhuhr: array[3],
      asr: array[4],
      maghrib: array[5],
      sunset: array[6],
      isha: array[7],
      midnight: array[8]
    }
  })
}

const getTunes = () => store.get('tunes')

const setMidnightMode = (value) => { store.set({ midnightMode: value }) }
const getMidnightMode = () => store.get('midnightMode')

const setAladhan = (json) => store.set(json)

const getCode = () => store.get('code')

const today = new Date()
// See Prayer Times API:
// - month start with 1 for January
// - date start with 0 for 1st day of the month
const month = today.getMonth() + 1
const date = today.getDate() - 1
let jsonPrm = `data.${month}.${date}`

const getHijriDate = (newMonth, newDate) => {
  if (newMonth && newDate) {
    jsonPrm = `data.${newMonth}.${newDate}`
  }
  const hDay = store.get(`${jsonPrm}.date.hijri.day`)
  const hMonth = store.get(`${jsonPrm}.date.hijri.month.en`)
  const hYear = store.get(`${jsonPrm}.date.hijri.year`)
  return hDay + ' ' + hMonth + ' ' + hYear
}

// Get prayer timings.
// Transformed the times in the timings table in toLocaleTimeString()
const getTableTimings = (newMonth, newDate) => {
  if (newMonth && newDate) {
    jsonPrm = `data.${newMonth}.${newDate}`;
  }

  const imsak = store.get('checkImsak')
    ? new Date(store.get(`${jsonPrm}.timings.Imsak`)).toLocaleTimeString().split(' ')[0]
    : false;

  const fajr = new Date(store.get(`${jsonPrm}.timings.Fajr`)).toLocaleTimeString().split(' ')[0];
  
  const sunrise = store.get('checkSunrise')
    ? new Date(store.get(`${jsonPrm}.timings.Sunrise`)).toLocaleTimeString().split(' ')[0]
    : false;
  
  const dhuhr = new Date(store.get(`${jsonPrm}.timings.Dhuhr`)).toLocaleTimeString().split(' ')[0];
  const asr = new Date(store.get(`${jsonPrm}.timings.Asr`)).toLocaleTimeString().split(' ')[0];
  const maghrib = new Date(store.get(`${jsonPrm}.timings.Maghrib`)).toLocaleTimeString().split(' ')[0];
  const isha = new Date(store.get(`${jsonPrm}.timings.Isha`)).toLocaleTimeString().split(' ')[0];

  const midnight = store.get('checkMidnight')
    ? new Date(store.get(`${jsonPrm}.timings.Midnight`)).toLocaleTimeString().split(' ')[0]
    : false;

  const tName = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const tTime = [fajr, dhuhr, asr, maghrib, isha];

  if (imsak) {
    tName.unshift('Imsak');
    tTime.unshift(imsak);
  }

  if (sunrise) {
    tName.splice(2, 0, 'Sunrise');
    tTime.splice(2, 0, sunrise);
  }

  if (midnight) {
    tName.push('Midnight');
    tTime.push(midnight);
  }

  let tTable = '';
  for (let i = 0; i < tTime.length; i++) {
    tTable += `<div class="row"><div class="p-name column" data-i18n="prayer.${tName[i]}">${tName[i]}</div><div class="p-time column">${tTime[i]}</div></div>`;
  }

  return tTable;
};

const setTheme = (theme) => store.set({ theme: theme })
const getTheme = () => store.get('theme')

const setLanguage = (lng) => store.set({ language: lng })
const getLanguage = () => store.get('language')

exports.setCityCountry = setCityCountry
exports.getCityCountry = getCityCountry
exports.getCity = getCity
exports.getCountry = getCountry
exports.setCalcMethod = setCalcMethod
exports.getCalcMethod = getCalcMethod
exports.setCustomAngle = setCustomAngle
exports.getCustomFajrAngle = getCustomFajrAngle
exports.getCustomIshaAngle = getCustomIshaAngle
exports.setCheckImsak = setCheckImsak
exports.setCheckSunrise = setCheckSunrise
exports.setCheckMidnight = setCheckMidnight
exports.getCheckImsak = getCheckImsak
exports.getCheckSunrise = getCheckSunrise
exports.getCheckMidnight = getCheckMidnight
exports.setTunes = setTunes
exports.getTunes = getTunes
exports.setMidnightMode = setMidnightMode
exports.getMidnightMode = getMidnightMode
exports.setAladhan = setAladhan
exports.getCode = getCode
exports.getHijriDate = getHijriDate
exports.getTableTimings = getTableTimings
exports.setTheme = setTheme
exports.getTheme = getTheme
exports.setLanguage = setLanguage
exports.getLanguage = getLanguage
