import * as CommandId from '../CommandId/CommandId.ts'
import * as DefaultCommandMap from '../DefaultCommandMap/DefaultCommandMap.ts'
import * as HandleMessagePort from '../HandleMessagePort/HandleMessagePort.ts'

export const commandMap = {
  ...DefaultCommandMap.commandMap,
  [CommandId.HandleMessagePort]: HandleMessagePort.handleMessagePort,
  [CommandId.HandleMessagePort2]: HandleMessagePort.handleMessagePort2,
}
