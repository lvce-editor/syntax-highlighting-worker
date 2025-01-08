import { MessagePortRpcClient } from '@lvce-editor/rpc'
import * as DefaultCommandMap from '../DefaultCommandMap/DefaultCommandMap.ts'

export const handleMessagePort = async (port: MessagePort) => {
  await MessagePortRpcClient.create({
    commandMap: DefaultCommandMap.commandMap,
    messagePort: port,
  })
  // TODO this should be handled by rpc
  port.postMessage('ready')
}
