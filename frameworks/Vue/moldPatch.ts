import {SetupContext} from '@vue/composition-api';

import {saveComposition} from './composition/saveComposition';
import {GetQuery} from '../../interfaces/GetQuery';
import {MoldDocument} from '../../interfaces/MoldDocument';
import {ActionState} from '../../frontend/interfaces/ActionState';


interface MoldPatchState<T> extends ActionState<T> {
  patch: (data: MoldDocument) => void;
}


export default function moldPatch<T>(
  context: SetupContext,
  set: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string
): MoldPatchState<T> {
  const {mold, instanceId, state: moldState} = saveComposition<T>(context, {
    backend,
    set,
    action: 'patch',
    query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
      ? { id: idOrQuery }
      : idOrQuery,
  });

  const state: MoldPatchState<T> = moldState as any;

  state.patch = (data: MoldDocument) => mold.start(instanceId, data);

  return state;
}
