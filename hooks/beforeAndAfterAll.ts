import {PreHookDefinition} from '../hooksMidleware/interfaces/HookDefinition';
import {MoldHook} from '../hooksMidleware/interfaces/MoldHooks';
import {ALL_ACTIONS} from '../hooksMidleware/constants';


/**
 * Position of hook is certainly that which is in the set.
 */
export default function beforeAndAfterAll(hook: MoldHook | MoldHook[], onlyActions?: string[]): PreHookDefinition {
  return {
    type: ['before', 'after'],
    action: (onlyActions) ? onlyActions : ALL_ACTIONS,
    hook,
  };
}