import {SetupContext} from '@vue/composition-api';
import {HighLevelProps} from '../../frontend/interfaces/MethodsProps';
import {InstanceActionState} from '../../frontend/interfaces/MethodsState';
import {saveComposition, SaveCompositionAdditionalProps} from './composition/saveComposition';


export default function moldPatch<T>(
  context: SetupContext,
  actionProps: HighLevelProps
): InstanceActionState<T> & SaveCompositionAdditionalProps {
  const {state} = saveComposition<T>(context, 'patch', actionProps);

  return state as InstanceActionState<T> & SaveCompositionAdditionalProps;
}
