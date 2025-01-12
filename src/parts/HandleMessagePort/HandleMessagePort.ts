import { MessagePortRpcClient } from '@lvce-editor/rpc'
import * as DefaultCommandMap from '../DefaultCommandMap/DefaultCommandMap.ts'

export const handleMessagePort = async (port: MessagePort): Promise<void> => {
  await MessagePortRpcClient.create({
    commandMap: DefaultCommandMap.commandMap,
    messagePort: port,
  })
}
