import * as RpcId from '../RpcId/RpcId.ts'
import * as RpcRegistry from '../RpcRegistry/RpcRegistry.ts'

export const send = (method, ...params) => {
  const rpc = RpcRegistry.get(RpcId.RendererWorker)
  rpc.send(method, ...params)
}

export const invoke = (method, ...params) => {
  const rpc = RpcRegistry.get(RpcId.RendererWorker)
  return rpc.invoke(method, ...params)
}
