import type { IpcRenderer } from 'electron'
import type electron from '../preload/electron'
import type { IpcChannel, IpcInvokeArgs, IpcInvokeReturn } from '../../types/ipc-methods'

type TypedIpcRenderer = Omit<IpcRenderer, 'invoke'> & {
  invoke<TChannel extends IpcChannel>(channel: TChannel, ...args: IpcInvokeArgs<TChannel>): IpcInvokeReturn<TChannel>
}

type ElectronBridge = Omit<typeof electron, 'ipcRenderer'> & {
  ipcRenderer: TypedIpcRenderer
}

declare global {
  interface Window {
    electron: ElectronBridge
    ipcRenderer: TypedIpcRenderer
  }
}

export { }
