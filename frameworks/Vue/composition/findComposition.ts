import {ActionState} from '../../../frontend/interfaces/ActionState';
import {SetupContext} from '@vue/composition-api';
import {omitObj} from '../../../helpers/objects';
import {ListResponse} from '../../../interfaces/ReponseStructure';
import {moldComposition} from './moldComposition';
import {ActionProps} from '../../../frontend/interfaces/ActionProps';
import {CompositionProps} from '../../../frontend/interfaces/CompositionProps';


export interface FindCompositionProps extends CompositionProps {
  disableInitialLoad?: boolean
}

export interface FindCompositionState<T> extends ActionState, Omit<ListResponse, 'data'> {
  // this is result.data
  items: T[] | null;
  load: (queryOverride: Record<string, any>) => void;
}


export function findComposition<T>(
  context: SetupContext,
  actionProps: FindCompositionProps
): FindCompositionState<T> {
  const stateTransform = (
    newState: ActionState<ListResponse<T>>
  ): Omit<FindCompositionState<T>, 'load'> => {
    return {
      ...newState,
      ...omitObj(newState.result, 'data') as Omit<ListResponse, 'data'>,
      items: newState.result?.data || null,
    };
  }

  const {mold, instanceId, state: moldState} = moldComposition<ListResponse<T>>(context, {
    ...omitObj(actionProps, 'disableInitialLoad') as ActionProps,
    isReading: true,
  }, stateTransform);

  if (!actionProps.disableInitialLoad) {
    // start request immediately
    mold.start(instanceId);
  }

  const state: FindCompositionState<T> = moldState as any;

  state.load = (queryOverride: Record<string, any>) => {
    mold.start(instanceId, undefined, queryOverride);
  };

  return state;
}
