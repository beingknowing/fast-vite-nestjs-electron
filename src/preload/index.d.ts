import type { IpcRenderer } from 'electron'
import electron from './electron'
import { type } from '../../types/auto-imports';

declare global {
  interface Window {
    electron: typeof electron
    ipcRenderer: IpcRenderer
    type: typeof type
  }
}
