import { ipcRenderer } from 'electron'
import { ipcInvoke } from './auto-gen/electron.ipc-auto'

export default {
  ipcRenderer,
  ...ipcInvoke,
  sendMsg: ipcInvoke.msg,
  readCredential: ipcInvoke.readCredential,
  onReplyMsg: (cb: (msg: string) => void) => ipcRenderer.on('reply-msg', (...args: [unknown, string]) => {
    cb(args[1])
  }),
}
