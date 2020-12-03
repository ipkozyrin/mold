import {SetupContext} from '@vue/composition-api';

import {InstanceActionState} from '../../frontend/interfaces/ActionState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';
import {JsonTypes} from '../../interfaces/Types';


export default function moldCreate<T>(
  context: SetupContext,
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, {
    backend,
    set,
    action: 'create',
    query,
  });

  return state as InstanceActionState<T> & SaveCompositionAdditionalProps;
}
