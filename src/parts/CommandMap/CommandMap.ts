import * as CommandId from '../CommandId/CommandId.ts'
import * as GetTokensViewport from '../GetTokensViewport/GetTokensViewport.ts'
import * as HandleMessagePort from '../HandleMessagePort/HandleMessagePort.ts'
import * as TextDocument from '../TextDocument/TextDocument.ts'
import * as TokenizeCodeBlock from '../TokenizeCodeBlock/TokenizeCodeBlock.ts'
import * as TokenizeIncremental from '../TokenizeIncremental/TokenizeIncremental.ts'
import * as Tokenizer from '../Tokenizer/Tokenizer.ts'

export const commandMap = {
  [CommandId.GetTokensViewport]: GetTokensViewport.getTokensViewport,
  [CommandId.HandleMessagePort]: HandleMessagePort.handleMessagePort,
  [CommandId.LoadTokenizer]: Tokenizer.loadTokenizer,
  [CommandId.SetLines]: TextDocument.setLines,
  [CommandId.TokenizeCodeBlock]: TokenizeCodeBlock.tokenizeCodeBlock,
  [CommandId.TokenizeIncremental]: TokenizeIncremental.tokenizeIncremental,
}
