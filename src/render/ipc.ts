import type { IpcChannel, IpcInvokeArgs, IpcInvokeReturn } from '../../types/ipc-methods'

export const ipcChannels = {
    msg: 'msg',
    ticket: 'ticket',
    saveCredential: 'saveCredential',
    readCredential: 'readCredential',
    getDomainUser: 'get-domain-user',
} as const satisfies Record<string, IpcChannel>

export const typedInvoke = <TChannel extends IpcChannel>(
    channel: TChannel,
    ...args: IpcInvokeArgs<TChannel>
): IpcInvokeReturn<TChannel> => window.electron.ipcRenderer.invoke(channel, ...args)
