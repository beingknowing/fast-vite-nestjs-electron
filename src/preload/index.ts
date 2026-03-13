
import { contextBridge } from 'electron'

import electron from './electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {

        contextBridge.exposeInMainWorld('electron', electron)
    } catch (error) {
        console.error(error)
    }
} else { 
    window.electron = electron
}
