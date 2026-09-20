import type { ContactBlock } from './contacts'
import type { AdvicePanel } from './advice'
import type { SelfHelpBlock } from './self-help'

export type InstructionBlock = ContactBlock | SelfHelpBlock
export type InstructionAction = {
  id: 'resolved' | 'unresolved' | 'alternatives'
  label: string
  appearance: 'primary' | 'secondary'
  target: 'W22' | 'W24' | 'W25' | 'W37'
}
export type InstructionsView = {
  screen: 'W15' | 'W18' | 'W20' | 'W21' | 'W36' | 'W22'
  locale: string
  layout: { showMenu: boolean }
  advice?: AdvicePanel & { triggerLabel: string }
  backTarget: string
  allowedActions: ('back' | InstructionAction['id'])[]
  footerActions: InstructionAction[]
  copy: { back: string; title: string; description: string; preview: string; unavailable: string }
  blocks: InstructionBlock[]
}
