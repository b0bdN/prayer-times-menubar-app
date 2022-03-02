const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  findCity: () => ipcRenderer.invoke('find-city'),
  send: (channel, data) => {
    const validChannels = ['settings', 'getNewTimingsTable', 'setPrayerTray', 'apply-settings', 'close-app']
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  receive: (channel, func) => {
    const validChannels = ['init-data', 'setNewTimingsTable', 'update-data']
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
  toggleTheme: (theme) => ipcRenderer.invoke('theme:toggle', theme),
  toggleLanguage: (...args) => ipcRenderer.invoke('language:toggle', ...args),
  loadTranslations: (keys) => ipcRenderer.invoke('load-translations', keys)
})
