import {SetupContext} from '@vue/composition-api';

import {ActionState} from '../../frontend/interfaces/ActionState';
import {moldComposition} from './composition/moldComposition';
import {JsonTypes} from '../../interfaces/Types';


interface MoldBatchDeleteState<T> extends ActionState<T> {
  delete: (ids: (string | number)[], queryOverride?: Record<string, any>) => void;
}


export default function moldBatchDelete<T>(
  context: SetupContext,
  set: string,
  query?: Record<string, JsonTypes>,
  backend?: string
): MoldBatchDeleteState<T> {
  const {mold, instanceId, state: moldState} = moldComposition<T>(context, {
    backend,
    set,
    action: 'batchDelete',
    query,
  });

  const state: MoldBatchDeleteState<T> = moldState as any;

  state.delete = (ids: (string | number)[], queryOverride?: Record<string, any>) => {
    mold.start(instanceId, ids, queryOverride);
  }

  return state;
}
