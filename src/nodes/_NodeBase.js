const ActionBase = require('../Action');


module.exports = class _NodeBase {
  constructor(main) {
    this._main = main;
    this.$defaultAction = 'default';
  }

  /**
   * Get mold path
   * @return {string} - root path of node.
   */
  get root() {
    return this._moldPath;
  }

  /**
   * Get mold of default action.
   * @return {object} - mold.
   */
  get mold() {
    return this.actions.default.mold;
  }

  get schema() {
    return this._schema;
  }


  $init(moldPath, schema) {
    this._moldPath = moldPath;
    this._schema = schema;
    this.actions = {};
  }

  $initActions(defaultActions) {
    const actions = _.defaultsDeep(_.cloneDeep(this.schema.actions), defaultActions);

    _.each(actions, (actionParams, actionName) => {
      this.actions[actionName] = this.$createAction(
        actionName,
        actionParams,
        this._urlParams,
        this._driverParams
      );
      // double to root of document for more convenience
      this[actionName] = this.actions[actionName];
    });
  }

  $createAction(actionName, actionParams, defaultUrlParams, defaultDriverParams) {
    const instance = new ActionBase(
      this._main,
      this,
      this._moldPath,
      actionName,
      this.$primitiveSchema,
      actionParams,
      defaultUrlParams,
      defaultDriverParams
    );

    instance.init();

    return instance;
  }

  params(urlParams, driverParams) {
    this._urlParams = _.cloneDeep(urlParams);
    this._driverParams = _.cloneDeep(driverParams);
  }

  /**
   * Update mold default action.
   * @param {string} newState - partial data
   */
  update(newState) {
    this.actions.default.update(newState);
  }

  updateSilent(newState) {
    this.actions.default.updateSilent(newState);
  }

  /**
   * It clears mold state for current instance and for its descendants.
   */
  // clear() {
  //   return this.actions.default.clear();
  // }

  /**
   * Listen changes of mold of default action.
   * @param {function} handler - Your handler.
   */
  onChange(handler) {
    this.actions.default.onChange(handler);
  }

  onAnyChange(handler) {
    this.actions.default.onAnyChange(handler);
  }

  /**
   * Unbind event listener.
   * @param {string} eventName - 'change' or 'any'
   * @param {function} handler - handler to remove
   */
  off(eventName, handler) {
    this.actions.default.off(eventName, handler);
  }

  /**
   * It removes all the events listeners and clears action storage.
   */
  destroy() {
    this.actions.default.destroy();
  }

};
