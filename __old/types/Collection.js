// Simple collection. There're only add and remove methods.

import _ from 'lodash';

import { concatPath } from '../../src/helpers';
import _TypeBase from '../../src/types/_TypeBase';

export default class Collection extends _TypeBase {
  static validateSchema(schema, schemaPath) {
    // if (!_.isPlainObject(schema.item))
    //   return `Schema definition of collection on "${schemaPath}" must have an "item" param!`;
  }

  constructor(main) {
    super(main);
  }

  get type() {
    return 'collection';
  }

  $initStorage(paths) {
    if (!_.isArray(this._main.$$state.getStorageData(paths.storage))) {
      this._main.$$state.setSilent(paths.storage, []);
    }
  }

  $init(paths, schema) {
    this.$initStorage(paths);
    super.$init(paths, schema);
  }

  /**
   * Get instance of child
   * @param {string|number} primaryId - primary id like 0 or '[0]'
   * @returns {object} - instance of child
   */
  child(primaryId) {
    const preparedPath = (_.isNumber(primaryId)) ? `[${primaryId}]` : primaryId;
    return this._main.child(preparedPath, this);
  }

  /**
   * Get paths of child of first level.
   * @param {string} primaryId
   * @returns {{mold: string, schema: string, storage: string}}
   */
  $getChildPaths(primaryId) {
    return {
      mold: concatPath(this._moldPath, primaryId),
      schema: concatPath(this._schemaPath, 'item'),
      storage: concatPath(this._storagePath, primaryId),
    }
  }


  /**
   * Get instance of child of first level.
   * @param {string} primaryId - id of element, like '[0]' or ["s-3"]
   * @returns {Object|undefined} - if undefined - it means not found.
   */
  $getChildInstance(primaryId) {
    if (!primaryId || !_.isString(primaryId)) return;
    if (!primaryId.match(/^\[[^\s\[\]]+]$/)) this._main.$$log.fatal(`Bad primaryId "${primaryId}"`);

    const paths = this.$getChildPaths(primaryId);

    return this._main.$$typeManager.$getInstanceByFullPath(paths);
  }

  /**
   * Add item to beginning of a collection.
   * @param {object} item
   * @param {object|undefined} eventData - additional data to event
   */
  unshift(item, eventData=undefined) {
    this._main.$$state.unshift(this._storagePath , item, eventData);
  }

  /**
   * Add to the end of a collection.
   * @param {object} item
   * @param {object|undefined} eventData - additional data to event
   */
  push(item, eventData=undefined) {
    this._main.$$state.push(this._storagePath , item, eventData);
  }

  /**
   * Remove item by uniq key
   * @param item
   * @param {object|undefined} eventData - additional data to event
   */
  remove(item, eventData=undefined) {
    this._main.$$state.remove(this._storagePath , item, eventData);
  }

}