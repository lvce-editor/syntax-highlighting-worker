import { MessagePortRpcClient, PlainMessagePortRpc } from '@lvce-editor/rpc'
import * as DefaultCommandMap from '../DefaultCommandMap/DefaultCommandMap.ts'

export const handleMessagePort = async (port: MessagePort): Promise<void> => {
  await MessagePortRpcClient.create({
    commandMap: DefaultCommandMap.commandMap,
    messagePort: port,
  })
}

export const handleMessagePort2 = async (port: MessagePort): Promise<void> => {
  await PlainMessagePortRpc.create({
    commandMap: DefaultCommandMap.commandMap,
    messagePort: port,
  })
}
