import type { IpcRenderer } from 'electron'
import type electron from '@/src/preload/electron'
import type { IpcChannel, IpcInvokeArgs, IpcInvokeReturn } from '@/types/ipc-methods'

type TypedIpcRenderer = Omit<IpcRenderer, 'invoke'> & {
  invoke<TChannel extends IpcChannel>(channel: TChannel, ...args: IpcInvokeArgs<TChannel>): IpcInvokeReturn<TChannel>
}

type ElectronBridge = Omit<typeof electron, 'ipcRenderer'> & {
  ipcRenderer: TypedIpcRenderer
}

declare global {
  interface Window {
    /**
     * 通过 `window.electron` 访问预加载脚本暴露的 API。
     *
     * @type {ElectronBridge}
     * @memberof Window
     */
    electron: ElectronBridge
    /**
     * 通过 `window.ipcRenderer` 直接访问预加载脚本中封装的 ipcRenderer 方法。
     *
     * @type {TypedIpcRenderer}
     * @memberof Window
     */
    ipcRenderer: TypedIpcRenderer
  }
}

export { }
