import * as Command from '@lvce-editor/command'
import * as Callback from '../Callback/Callback.ts'
import * as HandleJsonRpcMessage from '../JsonRpc/JsonRpc.ts'

const requiresSocket = () => {
  return false
}

const preparePrettyError = (error) => {
  return error
}

const logError = (error) => {
  console.error(error)
}

export const handleMessage = (event) => {
  return HandleJsonRpcMessage.handleJsonRpcMessage(
    event.target,
    event.data,
    Command.execute,
    Callback.resolve,
    preparePrettyError,
    logError,
    requiresSocket,
  )
}
