import * as IpcChildType from '../IpcChildType/IpcChildType.ts'
// @ts-ignore
import { IpcChildWithModuleWorker, IpcChildWithModuleWorkerAndMessagePort, IpcChildWithMessagePort } from '@lvce-editor/ipc/dist/browser.js'

export const getModule = (method) => {
  switch (method) {
    case IpcChildType.ModuleWorker:
      return IpcChildWithModuleWorker
    case IpcChildType.ModuleWorkerAndMessagePort:
      return IpcChildWithModuleWorkerAndMessagePort
    case IpcChildType.MessagePort:
      return IpcChildWithMessagePort
    default:
      throw new Error('unexpected ipc type')
  }
}
