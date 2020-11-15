import {Logger} from './Logger';
import BackendAdapter from '../../interfaces/BackendAdapter';
import PushAdapter from '../../interfaces/PushAdapter';
import MoldFrontendConfig from './MoldFrontendConfig';


export default interface MoldFrontendProps {
  config: MoldFrontendConfig;
  // fill almost one backend. Name of backend is used in any request.
  // "default" backend doesn't have to be specified in request.
  backends: {[index: string]: BackendAdapter};
  pushed: {[index: string]: PushAdapter};
  logger: Logger;
}
