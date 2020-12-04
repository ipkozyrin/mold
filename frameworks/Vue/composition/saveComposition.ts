import {onUnmounted, reactive, SetupContext} from '@vue/composition-api';

import Mold from '../../../frontend/Mold';
import {ActionState, InstanceActionState} from '../../../frontend/interfaces/ActionState';
import {omitUndefined} from '../../../helpers/objects';
import {INSTANCE_ID_PROP_NAME} from '../../../frontend/constants';
import {CompositionProps} from '../../../frontend/interfaces/CompositionProps';


export interface SaveCompositionAdditionalProps {
  save: (data: Record<string, any>) => void;
}

// TODO: review !!!!!!@@@!@!
interface SaveResult<T> {
  mold: Mold;
  instanceId: string;
  state: InstanceActionState<T>;
}


export function saveComposition<T>(
  context: SetupContext,
  // // use undefined for save purpose where only at save method calling
  // // is clear which action to use: create or update
  // actionName: string,
  actionProps: CompositionProps,
  // TODO: перезаписать а не расширить
  stateAdditions?: Record<string, any>
): SaveResult<T> {
  // @ts-ignore
  const mold: Mold = context.root.$mold;
  // init request
  const instanceId: string = mold.newRequest({
    action: actionName,
    ...actionProps,
  });
  const state: InstanceActionState<T> = reactive(omitUndefined({
    ...mold.getState(instanceId),
    [INSTANCE_ID_PROP_NAME]: instanceId,
    ...stateAdditions,
    // TODO: strong review !!!! - use data only
    save: (stateAdditions)
      ? (data: Record<string, any>) => mold.start(instanceId, data)
      : undefined,
  })) as any;
  // update reactive at any change
  mold.onChange(instanceId, (newState: ActionState) => {
    for (let key of Object.keys(newState)) state[key] = newState[key];
  });

  onUnmounted(() => {
    mold.destroyInstance(state[INSTANCE_ID_PROP_NAME]);
  });

  return {
    mold,
    instanceId,
    state,
  }
}
