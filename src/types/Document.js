import _ from 'lodash';

import { correctUpdatePayload, omitUnsaveable } from '../helpers';
import State from './State';


export default class Document extends State {
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema))
      return `Schema definition of document on "${schemaPath}" must have a "schema" param!`;
  }

  constructor(main) {
    super(main);

    // TODO: move to storage meta
    this._lastChanges = {};
  }

  get type() {
    return 'document';
  }

  get isLoading() {
    return this._main.$$stateManager.getMeta(this._moldPath, 'isLoading');
  }

  get isSaving() {
    return this._main.$$stateManager.getMeta(this._moldPath, 'isSaving');
  }

  /**
   * Get changes from last save to the moment.
   * @returns {object}
   */
  get lastChanges() {
    // TODO: use storage meta
    return this._lastChanges;
  }

  $init(paths, schema) {
    super.$init(paths, schema);

    this.action = {
      load: (preRequest) => {
        return this.$load(this._applyDefaults(preRequest, 'load'))
      },
      put: (newState, preRequest) => {
        return this.$put(newState, this._applyDefaults(preRequest, 'put'))
      },
      patch: (newState, preRequest) => {
        return this.$patch(newState, this._applyDefaults(preRequest, 'patch'))
      },
      remove: (preRequest) => {
        return this.$remove(this._applyDefaults(preRequest, 'remove'))
      },
    };
    this.actionDefaults = {};
    this._initActions();
  }

  getUrlParams() {
    // TODO: use storage meta
    // TODO: по идее на каждый запрос надо сохранять свои url params
    return this._main.$$state.getUrlParams(this._moldPath);
  }

  setUrlParams(params) {
    // TODO: use storage meta
    this._main.$$state.setUrlParams(this._moldPath, params);
  }

  update(newState, eventData=undefined) {
    this._lastChanges = correctUpdatePayload(this._lastChanges, newState);
    super.update(newState, eventData);
  }

  // TODO: updateSilent

  load(...params) { return this.action.load(...params) }
  put(...params) { return this.action.put(...params) }
  patch(...params) { return this.action.patch(...params) }
  remove(...params) { return this.action.remove(...params) }

  /**
   * Load data from driver.
   * @param {string|undefined} action - name of action
   * @param {object|undefined} driversRequestParams - params for driver's request
   * @returns {Promise}
   */
  $load(action=undefined, driversRequestParams=undefined) {
    this._main.$$stateManager.updateMeta(this._moldPath, { isSaving: true }, action);

    return this._doLoadRequest(driversRequestParams)
      .then((resp) => {
        // update mold with server response data
        this._main.$$stateManager.updateMeta(this._moldPath, { isSaving: false }, action);
        this._main.$$stateManager.updateTopLevelSilent(this._moldPath, resp.body, action);
        // TODO: use meta
        this._lastChanges = {};

        return resp;
      }, (err) => {
        this._main.$$stateManager.updateMeta(this._moldPath, { isSaving: false }, action);

        return Promise.reject(err);
      });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @param {object} preRequest - raw params to driver's request
   * @returns {Promise}
   */
  $put(newState=undefined, preRequest=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.updateSilent(this._storagePath, {$saving: true});

    const request = _.defaultsDeep({
      method: 'put',
      moldPath: this._moldPath,
      payload: omitUnsaveable(this._mold, this.schema),
    }, preRequest);

    return this._main.$$state.$$request.sendRequest(request, this.schema, this.getUrlParams())
      .then((resp) => {
        // update mold with server response data
        this._main.$$state.updateSilent(this._storagePath, {
          ...resp.body,
          $saving: false,
        });
        this._lastChanges = {};

        return resp;
      }, (err) => {
        this._main.$$state.updateSilent(this._storagePath, {$saving: false});
        return Promise.reject(err);
      });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @param {object} preRequest - raw params to driver's request
   * @returns {Promise}
   */
  $patch(newState=undefined, preRequest=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.updateSilent(this._storagePath, {$saving: true});

    const request = _.defaultsDeep({
      method: 'patch',
      moldPath: this._moldPath,
      payload: omitUnsaveable(this._lastChanges, this.schema),
    }, preRequest);

    return this._main.$$state.$$request.sendRequest(request, this.schema, this.getUrlParams())
      .then((resp) => {
        // update mold with server response data
        this._main.$$state.updateSilent(this._storagePath, {
          ...resp.body,
          $saving: false,
        });
        this._lastChanges = {};

        return resp;
      }, (err) => {
        this._main.$$state.updateSilent(this._storagePath, {$saving: false});
        return Promise.reject(err);
      });
  }

  /**
   * Delete a document via documentsCollection.
   * You can't remove document that not inside a collection.
   * @param {object} preRequest
   * @return {Promise}
   */
  $remove(preRequest=undefined) {
    const myDocumentsCollection = this.getParent();

    if (!myDocumentsCollection)
      this._main.$$log.fatal(`You can remove only from DocumentsCollection`);

    if (myDocumentsCollection.type != 'documentsCollection')
      this._main.$$log.fatal(`The parent of document isn't a DocumentsCollection. You can remove only from DocumentsCollection`);

    return myDocumentsCollection.remove(this.mold, preRequest);
  }

  _doLoadRequest(driversRequestParams) {
    const request = _.defaultsDeep({
      method: 'get',
      moldPath: this._moldPath,
    }, driversRequestParams);

    // TODO: ??? getUrlParams
    return this._main.$$state.$$request.sendRequest(request, this.schema, this.getUrlParams());
  }

  _applyDefaults(preRequest, actionName) {
    if (!this.actionDefaults[actionName]) return preRequest;

    return _.defaultsDeep(_.cloneDeep(preRequest), this.actionDefaults[actionName]);
  }

  _initActions() {
    _.each(this.schema.action, (item, name) => {
      if (_.isFunction(item)) {
        // custom method or overwrote method
        this.action[name] = (...params) => item.bind(this)(...params, this);
      }
      else if (_.isPlainObject(item)) {
        // Default acton's params
        this.actionDefaults[name] = item;
      }
    });
  }

}
