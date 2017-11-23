import _ from 'lodash';

import { concatPath, convertFromLodashToSchema } from '../helpers';
import _TypeBase from './_TypeBase';


export default class Container extends _TypeBase {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema))
      return `Schema definition of container on "${schemaPath}" must has a "schema" param!`;
  }

  constructor(main) {
    super(main);

    this._defaultAction = 'default';
  }

  get type() {
    return 'state';
  }

  $initStorage(moldPath) {
    this._main.$$stateManager.initState(moldPath, this._defaultAction, {});
  }

  $init(moldPath, schema) {
    this.$initStorage(moldPath);
    // TODO: !!!! review
    super.$init(moldPath, schema);

    this.actions = {
      'default': this._generateLoadAction(),
    };

    // this.__readOnlyProps = [];
    // _.each(this.schema.schema, (item, name) => {
    //   if (item.readOnly) this.__readOnlyProps.push(name);
    // });
  }

  /**
   * Update container data
   * @param {string} newState
   * @param {object|undefined} eventData - additional data to event
   */
  update(newState, eventData=undefined) {
    //this._checkForUpdateReadOnly(newState);
    // TODO: eventData
    // TODO: use default action
    this._main.$$stateManager.updateTopLevel(this._moldPath, this._defaultAction, newState, eventData);
  }

  updateSilent(newState, eventData=undefined) {
    //this._checkForUpdateReadOnly(newState);
    // TODO: eventData
    // TODO: use default action
    this._main.$$stateManager.updateTopLevelSilent(this._moldPath, this._defaultAction, newState, eventData);
  }

  // _checkForUpdateReadOnly(newState) {
  //   const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);
  //
  //   if (!_.isEmpty(forbiddenRoProps)) {
  //     this._main.$$log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
  //   }
  // }

}
