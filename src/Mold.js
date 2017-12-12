import _ from 'lodash';


export default class _Mold {
  constructor(main, moldPath, actionName, fullSchema) {
    this._main = main;
    this._moldPath = moldPath;
    this._actionName = actionName;
    this._schema = fullSchema;
  }

  get state() {
    return this._main.$$storage.getCombined(this._moldPath, this._actionName);
  }

  init() {
    this._initSchema();
    // this.__readOnlyProps = [];
    // _.each(this.schema.schema, (item, name) => {
    //   if (item.readOnly) this.__readOnlyProps.push(name);
    // });
  }

  /**
   * Update top level state.
   * It casts values before update.
   * @param {object, array} newState - it's plain object or collection
   */
  update(newState) {
    const correctValues = this._main.$$typeManager.castData(this._schema, newState);
    this._main.$$storage.updateTopLevel(this._moldPath, this._actionName, correctValues);
  }

  /**
   * Update top level state silently
   * It casts values before update.
   * @param {object, array} newState - it's plain object or collection
   */
  updateSilent(newState) {
    const correctValues = this._main.$$typeManager.castData(this._schema, newState);
    this._main.$$storage.updateTopLevelSilent(this._moldPath, this._actionName, correctValues);
  }

  _initSchema() {
    let initialState = this._getRootInitialState();

    // init primitives
    if (_.isPlainObject(initialState)) {
      initialState = this._getPrimitivesInitialStates();
    }

    this._main.$$storage.initState(this._moldPath, this._actionName, initialState);
  }

  _getRootInitialState() {
    const rootTypeName = this._schema.type;

    if (!_.includes(['assoc', 'collection'], rootTypeName)) {
      this._main.$$log.fatal(`ERROR: bad root type "${rootTypeName}" for "${this._moldPath}" action "${this._actionName}"`);
    }

    const rootType = this._main.$$typeManager.getType(rootTypeName);

    return rootType.getInitial();
  }

  _getPrimitivesInitialStates() {
    const result = {};
    const schema = this._schema.items || this._schema.item;

    _.each(schema, (item, name) => {
      result[name] = this._main.$$typeManager.getInitial(item.type);
    });

    return result;
  }

  // _checkForUpdateReadOnly(newState) {
  //   const forbiddenRoProps = _.intersection(_.keys(newState), this.__readOnlyProps);
  //
  //   if (!_.isEmpty(forbiddenRoProps)) {
  //     this._main.$$log.fatal(`You can't write to read only props ${JSON.stringify(forbiddenRoProps)}`);
  //   }
  // }


}
