const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  findCity: () => ipcRenderer.invoke('find-city'),
  send: (channel, data) => {
    const validChannels = ['settings', 'getNewTimingsTable', 'apply-settings', 'close-app']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel, func) => {
    const validChannels = ['init-data', 'setNewTimingsTable', 'update-data']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  }
})
