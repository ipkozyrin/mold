import _ from 'lodash';

import { eachSchema } from '../helpers';


export default class _Mold {
  constructor(stateManager, moldPath, actionName, schema) {
    this._stateManager = stateManager;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._schema = schema;
    this._state = undefined;

    // TODO: set moldTransform to storage
  }

  get state() {
    return this._state;
  }

  init() {
    this._initSchema();
    // this.__readOnlyProps = [];
    // _.each(this.schema.schema, (item, name) => {
    //   if (item.readOnly) this.__readOnlyProps.push(name);
    // });
  }

  update(newState, eventData=undefined) {
    //this._checkForUpdateReadOnly(newState);
    this._stateManager.updateTopLevel(this._moldPath, this._actionName, newState, eventData);
    // TODO: сделать мутацию this._state - спрашивая каждый тип
  }

  updateSilent(newState, eventData=undefined) {
    //this._checkForUpdateReadOnly(newState);
    this._stateManager.updateTopLevel(this._moldPath, this._actionName, newState, eventData);
    // TODO: сделать мутацию this._state - спрашивая каждый тип
  }

  _initSchema() {
    // TODO: берем корневой элемент и инициализируем его и берем у него mold
    //this._state;

    //this._stateManager.initState(this._moldPath, this._actionName, actionStateRootContainer);

    eachSchema(this._schema, (schemaPath, schema) => {

    });
  }

  // _checkForUpdateReadOnly(newState) {
  //   const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);
  //
  //   if (!_.isEmpty(forbiddenRoProps)) {
  //     this._main.$$log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
  //   }
  // }


}
