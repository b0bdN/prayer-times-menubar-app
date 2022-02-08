// const { ipcRenderer } = require('electron')
const fetch = require('node-fetch')

function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    return res
  } else {
    throw new Error(`The HTTP status of the reponse: ${res.status} (${res.statusText})`)
  }
}

const getTimingsByCity = function (url, options) {
  fetch(url, {
    method: 'post',
    body: JSON.stringify(options),
    headers: { 'Content-Type': 'application/json' }
  }).then(checkStatus)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error(err))
}
