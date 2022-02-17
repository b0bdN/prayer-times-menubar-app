// Init data.
/*
 args[0]: app version
 args[1]: city, Country
 args[2]: hijri date
 args[3]: timings table
 args[4]: calculation method
 args[5 - 7]: checkbox imsak, sunrise, midnight
 args[8]: tunes
 args[9]: midnightMode
*/
window.api.receive('init-data', (args) => {
  document.getElementById('version').innerHTML = args[0]
  document.getElementById('city').value = args[1]
  document.getElementById('date-h').innerHTML = args[2]
  document.getElementById('timings-table').innerHTML = args[3]
  document.getElementById('calculation').value = args[4]
  customMethod(args[4])
  document.getElementById('checkImsak').checked = args[5]
  document.getElementById('checkSunrise').checked = args[6]
  document.getElementById('checkMidnight').checked = args[7]
  if (args[8]) {
    document.getElementById('tuneImsak').value = args[8].imsak
    document.getElementById('tuneFajr').value = args[8].fajr
    document.getElementById('tuneSunrise').value = args[8].sunrise
    document.getElementById('tuneDhuhr').value = args[8].dhuhr
    document.getElementById('tuneAsr').value = args[8].asr
    document.getElementById('tuneMaghrib').value = args[8].maghrib
    document.getElementById('tuneIsha').value = args[8].isha
    document.getElementById('tuneMidnight').value = args[8].midnight
  }
  if (args[9] === '0') {
    document.getElementById('midnightStd').checked = true
    document.getElementById('midnightJafari').checked = false
  } else {
    document.getElementById('midnightStd').checked = false
    document.getElementById('midnightJafari').checked = true
  }
})

// Get today's date and time (Gregorian).
const getDateTime = () => {
  const dateOpts = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  const timeOpts = {
    hour: '2-digit',
    minute: '2-digit'
  }
  const language = navigator.language
  const dateTimeNow = new Date()

  const dateLocale = dateTimeNow.toLocaleDateString(language, dateOpts)
  const timeLocale = dateTimeNow.toLocaleTimeString(language, timeOpts)

  document.getElementById('date-g').innerHTML = dateLocale
  document.getElementById('clock').innerHTML = timeLocale
}
setInterval(getDateTime, 1000)

const getNextPrayer = () => {
  const today = new Date()
  const timeString = today.toTimeString().substr(0, 8) // HH:MM:SS
  const pNames = document.getElementsByClassName('p-name')
  const pTimes = document.getElementsByClassName('p-time')

  for (let i = 0; i < pTimes.length; i++) {
    const t = pTimes[i].innerHTML
    const today = new Date().toJSON().slice(0, 10).replace(/-/g, '/') // today = YYYY/MM/DD

    if (timeString < t) {
      const start = new Date(today + ' ' + t)
      const end = new Date(today + ' ' + timeString)

      diffTime(start, end)
      document.querySelector('.content .next-prayer').innerHTML = pNames[i].innerHTML

      window.api.send('setPrayerTray', [
        pNames[i].innerHTML,
        pTimes[i].innerHTML
      ])

      break
    } else if (pNames[i].innerHTML === 'Midnight' && t >= '00:00' && t < '01:00') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowJSON = tomorrow.toJSON().slice(0, 10).replace(/-/g, '/')
      const start = new Date(tomorrowJSON + ' ' + t)
      const end = new Date(today + ' ' + timeString)

      diffTime(start, end)
      document.querySelector('.content .next-prayer').innerHTML = pNames[i].innerHTML

      window.api.send('setPrayerTray', [
        pNames[i].innerHTML,
        pTimes[i].innerHTML
      ])

      break
    } else if (timeString === (t + ':00')) {
      console.log(`It's ${pNames[i].innerHTML} time!`)
      // TODO: add sounds (https://www.electronjs.org/docs/latest/api/notification#playing-sounds)
      const NOTIFICATION_TITLE = `It's time to pray ${pNames[i].innerHTML}`
      const NOTIFICATION_BODY = '[29:45]' +
        ' Recite, [O Muḥammad], what has been revealed to you of the Book and establish prayer.' +
        ' Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.' +
        ' And Allah knows that which you do.'

      new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).show()

      break
    }
  }

  function diffTime (start, end) {
    const diff = Math.abs(Math.round((end.getTime() - start.getTime()) / 60000))
    const diffHour = Math.floor(diff / 60)
    const diffMinutes = diff % 60

    const tNote = document.querySelector('.content .t-note')
    if (diffHour >= 1) {
      tNote.innerHTML = diffHour + ' h ' + diffMinutes + ' min left'
    } else {
      tNote.innerHTML = diffMinutes + ' min left'
    }
  }

  // If midnight (00:00), get the next table of timings
  if (timeString === '00:00:00') {
    window.api.send('getNewTimingsTable')
  }
}
setInterval(getNextPrayer, 1000)

// Update the timings table at midnight (00:00)
/*
  args[0]: hijri date
  args[1]: timings table
*/
window.api.receive('setNewTimingsTable', (args) => {
  document.getElementById('date-h').innerHTML = args[0]
  document.getElementById('timings-table').innerHTML = args[1]
})

// Toogle settings by clicking the nav-icon.
document.getElementById('nav-icon').addEventListener('click', () => {
  toogleSettings()
  window.api.send('settings')
})

// Check if the settings pannel is hidden or visible.
const toogleSettings = () => {
  const settings = document.querySelector('#settings .content')
  if (settings.classList.contains('hidden')) {
    console.log('Settings is now visible.')
    document.getElementById('main').style.height = '110px'
    visibleOrHidden('#main .content', 'hidden')
    visibleOrHidden('#details', 'hidden')
    document.getElementById('settings').style.height = '360px'
    visibleOrHidden('#settings .content', 'visible')
    document.getElementById('nav-icon').className = 'open'
  } else {
    console.log('Settings is now hidden.')
    document.getElementById('main').style.height = '180px'
    visibleOrHidden('#main .content', 'visible')
    visibleOrHidden('#details', 'visible')
    document.getElementById('settings').style.height = '0'
    visibleOrHidden('#settings .content', 'hidden')
    document.getElementById('nav-icon').classList.remove('open')
  }
}

function visibleOrHidden (querry, visibility) {
  const x = document.querySelector(querry)
  if (x.classList.contains('visible')) {
    x.classList.remove('visible')
    x.classList.add('hidden')
  } else if (x.classList.contains('hidden')) {
    x.classList.remove('hidden')
    x.classList.add('visible')
  } else {
    x.classList.add(visibility)
  }
}

// Geolocation.
// Find city and country by clicking in the button.
document.querySelector('#settings .geolocation').addEventListener('click', () => {
  window.api.findCity().then((result) => {
    document.getElementById('city').value = result
  })
})

// Custom angles.
document.getElementById('calculation').addEventListener('click', () => {
  const calc = document.getElementById('calculation').value
  customMethod(calc)
})

// Check if the calculation method is custom (99) or not.
// Show/Hide the angles settings.
const customMethod = (method) => {
  if (method === '99') {
    document.getElementById('custom-angle').style.display = 'flex'
  } else {
    document.getElementById('custom-angle').style.display = 'none'
  }
}

// Apply button.
// TODO: add custom angle + tune (https://aladhan.com/calculation-methods).
document.getElementById('apply-btn').addEventListener('click', () => {
  const cityCountry = document.getElementById('city').value
  const method = document.getElementById('calculation').value
  const fajrAngle = document.getElementById('fajr-angle').value
  const ishaAngle = document.getElementById('isha-angle').value
  const checkImsak = document.getElementById('checkImsak').checked
  const checkSunrise = document.getElementById('checkSunrise').checked
  const checkMidnight = document.getElementById('checkMidnight').checked
  const tuneImsak = document.getElementById('tuneImsak').value
  const tuneFajr = document.getElementById('tuneFajr').value
  const tuneSunrise = document.getElementById('tuneSunrise').value
  const tuneDhuhr = document.getElementById('tuneDhuhr').value
  const tuneAsr = document.getElementById('tuneAsr').value
  const tuneMaghrib = document.getElementById('tuneMaghrib').value
  const tuneIsha = document.getElementById('tuneIsha').value
  const tuneMidnight = document.getElementById('tuneMidnight').value
  const midnightMode = document.querySelector('input[name="midnightMode"]:checked').value

  window.api.send('apply-settings', [
    cityCountry,
    method,
    fajrAngle,
    ishaAngle,
    checkImsak,
    checkSunrise,
    checkMidnight,
    tuneImsak,
    tuneFajr,
    tuneSunrise,
    tuneDhuhr,
    tuneAsr,
    tuneMaghrib,
    tuneIsha,
    tuneMidnight,
    midnightMode
  ])
})

// Update Data.
/*
  data[0]: hijri date
  data[1]: timings table
  data[2 - 4]: check Imsak, Sunrise, Midnight
*/
window.api.receive('update-data', (data) => {
  document.getElementById('date-h').innerHTML = data[0]
  document.getElementById('timings-table').innerHTML = data[1]
  document.getElementById('checkImsak').checked = data[2]
  document.getElementById('checkSunrise').checked = data[3]
  document.getElementById('checkMidnight').checked = data[4]
  toogleSettings()
  window.api.send('settings')
})

// Quit button.
document.getElementById('close-btn').addEventListener('click', () => {
  window.api.send('close-app')
})
