const path = require('path')

const pathPrefix = 'assets/adhans'

const adhanFiles = [
  {
    name: 'Masjid Al Haram',
    path: path.join(__dirname, `${pathPrefix}/masjidul_haram.mp3`)
  },
  {
    name: 'Mishary Rashid Alafasy',
    path: path.join(__dirname, `${pathPrefix}/mishari.mp3`)
  },
  {
    name: 'Salah Mansoor Az-Zahrani',
    path: path.join(__dirname, `${pathPrefix}/mansoor_zahrani.mp3`)
  },
  {
    name: 'Hafiz Mustafa Özcan',
    path: path.join(__dirname, `${pathPrefix}/mustafa_ozcan.mp3`)
  }
]

exports.adhanFiles = adhanFiles
