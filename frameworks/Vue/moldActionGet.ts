import {SetupContext} from '@vue/composition-api';

import {getComposition, GetCompositionState} from './composition/getComposition';
import {GetQuery} from '../../interfaces/GetQuery';


export default function moldActionGet<T>(
  context: SetupContext,
  set: string,
  actionName: string,
  idOrQuery?: (string | number) | GetQuery,
  backend?: string
): GetCompositionState<T> {
  const {state} = getComposition<T>(context, {
    backend,
    set,
    action: actionName,
    query: (typeof idOrQuery === 'string' || typeof idOrQuery === 'number')
      ? { id: idOrQuery }
      : idOrQuery,
  });

  return state;
}
