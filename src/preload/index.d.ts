import type { IpcRenderer } from 'electron'
import type electron from '../preload/electron'

declare global {
  interface Window {
    electron: typeof electron
    ipcRenderer: IpcRenderer
  }
}

export { }
