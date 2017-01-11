import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase{
  constructor(main) {
    super(main);
  }

  get type() {
    return 'container';
  }

  $init(moldPath, schemaPath, schema) {
    super.$init(moldPath, schemaPath, schema);
  }

  /**
   * Get instance of child
   * @param {string} path - path relative to this instance root
   * @returns {object} - instance of child
   */
  child(path) {
    return this._main.child(path, this);
  }

  /**
   * Get paths of child of first level.
   * @param {string} childPath
   * @returns {{mold: string, schema: string, storage: string}}
   */
  $getChildPaths(childPath) {
    return {
      mold: concatPath(this._moldPath, childPath),
      schema: concatPath(this._schemaPath, concatPath('schema', convertFromLodashToSchema(childPath))),
      storage: concatPath(this._storagePath, childPath),
    }
  }

  /**
   * Get instance of child of first level.
   * @param {string} childPath
   * @returns {*}
   */
  $getChildInstance(childPath) {
    if (childPath.match(/(\.|\[)/)) this._main.$$log.fatal(`Bad child path "${childPath}"`);

    const paths = this.$getChildPaths(childPath);

    // get container instance
    return this._main.$$schemaManager.$getInstanceByFullPath(paths.mold, paths.schema, paths.storage);
  }

  update(newState) {
    this._main.$$state.update(this._root, this._storagePath, _.cloneDeep(newState));
  }

}
