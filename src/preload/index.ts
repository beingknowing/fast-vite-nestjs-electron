
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

import electron from './electron'






// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electronAPI', electronAPI);

        contextBridge.exposeInMainWorld('electron', electron)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electronAPI = electronAPI
    // @ts-ignore (define in dts)
    window.electron = electron


}
