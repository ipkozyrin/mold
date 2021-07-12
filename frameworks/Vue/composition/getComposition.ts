import {ActionState} from '../../../frontend/interfaces/ActionState';
import {moldComposition} from './moldComposition';
import {ActionProps} from '../../../frontend/interfaces/ActionProps';
import {ItemResponse} from '../../../interfaces/ReponseStructure';


export interface GetCompositionState<T> extends ActionState {
  // it is result.data
  item: T | null;
  load: (queryOverride?: Record<string, any>) => void;
}


export function getComposition<T>(
  actionProps: ActionProps,
  disableInitialLoad: boolean = false
): GetCompositionState<T> {
  const stateTransform = (
    newState: ActionState<ItemResponse<T>>
  ): Omit<GetCompositionState<T>, 'load'> => {
    return {
      ...newState,
      item: newState.result?.data || null,
    };
  }
  // isReading param will be set at mold.request.register() method
  const {mold, instanceId, state: moldState} = moldComposition<ItemResponse<T>>(
    { ...actionProps, isReading: true },
    stateTransform
  );

  if (!disableInitialLoad) {
    // start request immediately
    mold.start(instanceId);
  }

  const state: GetCompositionState<T> = moldState as any;

  state.load = () => {
    mold.start(instanceId);
  };

  return state;
}
