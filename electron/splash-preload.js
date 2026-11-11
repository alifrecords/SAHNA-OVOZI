const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('splashBridge', { onProgress: cb => ipcRenderer.on('progress', (_e, s) => cb(s)) });
