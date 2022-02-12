const { app, globalShortcut, ipcMain } = require('electron')
const { menubar } = require('menubar')
const path = require('path')
const fetch = require('node-fetch')
const config = require('./config.js')
const store = require('./store.js')

const mb = menubar({
  browserWindow: {
    width: 280,
    height: 550,
    minWidth: 280,
    minHeight: 550,
    maxWidth: 560,
    maxHeight: 550,
    // resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  },
  preloadWindow: true
})

// console.log(app.getPath('userData'))

// openDevTools.
// mb.on('after-create-window', () => {
//   mb.window.openDevTools()
// })

// To avoid flash when opening the menubar app.
mb.app.commandLine.appendSwitch('disable-backgrounding-occluded-windows', 'true')

mb.on('ready', async () => {
  console.log('starting')

  // Register a globalShortcut listener to show/hide the window.
  const ret = globalShortcut.register('Alt+CmdOrCtrl+P', () => {
    console.log('globalShortcut Alt+CmdOrCtrl+P is pressed.')
    if (mb.window.isVisible()) {
      mb.window.hide()
    } else {
      mb.window.show()
    }
  })
  if (!ret) {
    console.log('gS failed')
  }

  // Get the data onload.
  const init = async () => {
    // TODO: create a function to download the new timings in January 1st.
    if (store.getCode() !== 200) {
      console.log('Storage: timings not found.')
      if (!store.getCity()) {
        console.log('Storage: city not found.')
        geolocation()
      }
      const city = store.getCity()
      const country = store.getCountry()
      const method = store.getCalcMethod() ? store.getCalcMethod() : ''
      const tunes = store.getTunes() ? store.getTunes() : false
      const midnightMode = store.getMidnightMode() ? store.getMidnightMode() : '0'
      await getTimings(city, country, method, tunes, midnightMode)
    }
  }

  const initData = () => {
    console.log('Storage: fetching data..')
    const cc = store.getCityCountry()
    const hijriDate = store.getHijriDate()
    const calcMethod = store.getCalcMethod() ? store.getCalcMethod() : 'auto'
    const checkImsak = store.getCheckImsak() ? store.getCheckImsak() : false
    const checkSunrise = store.getCheckSunrise() ? store.getCheckSunrise() : false
    const checkMidnight = store.getCheckMidnight() ? store.getCheckMidnight() : false
    const tuneValues = store.getTunes() ? store.getTunes() : false
    const midnightMode = store.getMidnightMode() ? store.getMidnightMode() : '0' // 0 by default for Standard
    const tableTimings = store.getTableTimings()

    mb.window.webContents.send('init-data', [
      cc,
      hijriDate,
      tableTimings,
      calcMethod,
      checkImsak,
      checkSunrise,
      checkMidnight,
      tuneValues,
      midnightMode
    ])
  }
  await init()
  initData()

  mb.showWindow()

  // Geolocation - IPinfo.io
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

  ipcMain.handle('find-city', () => {
    geolocation()
    const result = store.getCityCountry()
    console.log(result)
    return result
  })

  // TODO: add more parameters after adding them in the settings pannel (e.g. school, hijri adjustment, latitudeAdjustmentMethod  ...).
  async function getTimings (city, country, method, tunes, midnightMode) {
    console.log('Fecth timings with Aladhan API.')
    let url = `https://api.aladhan.com/v1/calendarByCity?annual=true&city=${city}&country=${country}&midnightMode=${midnightMode}`

    if (method !== 'auto') url += `&method=${method}`

    if (method === '99') { // If custom method.
      const fajrAngle = store.getCustomFajrAngle() || 'null'
      const ishaAngle = store.getCustomIshaAngle() || 'null'

      url += `&methodSettings=${fajrAngle},null,${ishaAngle}`
    }

    if (tunes) {
      let tunesValues = ''
      for (const t in tunes) {
        tunesValues += tunes[t] + ','
      }

      url += `&tune=${tunesValues.slice(0, -1)}`
    }

    console.log(url)

    const response = await fetch(url)

    if (response.ok) {
      const json = await response.json()
      store.setAladhan(json)
    } else {
      const text = await response.text()
      console.log(`Error fetching data, status: '${response.status}', text: '${text}'`)
    }
  }

  // Settings: change the window's size.
  // TODO: find another method instead of hideWindow() and showWindow().
  ipcMain.on('settings', () => {
    const [width, height] = mb.window.getSize()
    if (width !== 280) {
      console.log('width 560 to 280')
      mb.hideWindow()
      mb.window.setSize(280, height, true)
      mb.showWindow()
    } else {
      console.log('width 280 to 560')
      mb.hideWindow()
      mb.window.setSize(560, height, true)
      mb.showWindow()
    }
  })

  // Apply the new settings - button.
  // TODO: check if online/offline and input an error if offline.
  ipcMain.on('apply-settings', async (event, args) => {
    console.log('Apply button clicked.')
    let changed = false // init to know if a parameter has been changed.
    /*
    args[0]: city, country
    args[1]: calculation method (auto, 1..14, 99)
    args[2 - 3]: fajr angle, isha angle
    args[4 - 6]: checkImsak, checkSunrise, checkMidnight (true/false)
    args[7 - 14]: tune Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, Midnight
    args[15]: midnightMode
    */

    // <input> city, country.
    // TODO: check if the city and country are separated by a comma (,).
    const input = args[0].replace(/\s/g, '')
    const city = input.split(',')[0]
    const country = input.split(',')[1]
    if (city !== store.getCity()) {
      changed = true
      console.log('Storage: the city is different.')
      store.setCityCountry(city, country)
    }

    // <select> calculation method.
    const calcMethod = args[1]
    if (calcMethod !== store.getCalcMethod()) {
      changed = true
      console.log('Storage: the calculation method is different.')
      store.setCalcMethod(calcMethod)
    }

    // fajr and isha angles.
    const fajrAngle = args[2]
    const ishaAngle = args[3]
    if (fajrAngle !== store.getCustomFajrAngle() || ishaAngle !== store.getCustomIshaAngle()) {
      changed = true
      console.log('Storage: the custom angles are different.')
      store.setCustomAngle(fajrAngle, ishaAngle)
    }

    let check = false
    // Checkboxes show/hide imsak, sunrise, midnight.
    const checkImsak = args[4]
    if (checkImsak !== store.getCheckImsak) {
      check = true
      store.setCheckImsak(checkImsak)
    }

    const checkSunrise = args[5]
    if (checkSunrise !== store.getCheckSunrise) {
      check = true
      store.setCheckSunrise(checkSunrise)
    }

    const checkMidnight = args[6]
    if (checkMidnight !== store.getCheckMidnight) {
      check = true
      store.setCheckMidnight(checkMidnight)
    }

    // Custom times adjustments (tunes)
    const tunes = {
      imsak: args[7],
      fajr: args[8],
      sunrise: args[9],
      dhuhr: args[10],
      asr: args[11],
      maghrib: args[12],
      sunset: '0',
      isha: args[13],
      midnight: args[14]
    }

    const tunesArray = []
    for (const i in tunes) {
      tunesArray.push(tunes[i])
    }

    if (JSON.stringify(tunes) !== JSON.stringify(store.getTunes())) {
      changed = true
      console.log('Storage: the times adjustments are different.')
      store.setTunes(tunesArray)
    }

    // MidnightMode
    const midnightMode = args[15]
    if (midnightMode !== store.getMidnightMode()) {
      changed = true
      console.log('Storage: the parameter midnightMode is different.')
      store.setMidnightMode(midnightMode)
    }

    // Download the new timings.
    if (changed || check) {
      console.log('Storage: some parameters are different.')
      if (changed) {
        await getTimings(city, country, calcMethod, tunes, midnightMode)
      }
      mb.window.webContents.send('update-data', [
        store.getHijriDate(),
        store.getTableTimings(),
        store.getCheckImsak(),
        store.getCheckSunrise(),
        store.getCheckMidnight()
      ])
    }
  })

  // Notifications
  mb.app.setAppUserModelId(process.execPath)

  // Close the app - button.
  ipcMain.on('close-app', () => {
    console.log('Close button clicked.')
    app.quit()
  })
})

mb.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

mb.app.on('window-will-quit', () => {
  globalShortcut.unregisterAll()
})
