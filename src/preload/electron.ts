import { ipcRenderer } from 'electron'
import { ipcInvoke } from './electron.ipc-auto'

export default {
  ipcRenderer,
  ...ipcInvoke,
  sendMsg: ipcInvoke.msg,
  readCredential: ipcInvoke.readCredential,
  onReplyMsg: (cb: (msg: string) => any) => ipcRenderer.on('reply-msg', (...args: [unknown, string]) => {
    cb(args[1])
  }),
}
