import _ from 'lodash';

import { correctUpdatePayload, omitUnsaveable } from '../helpers';
import Container from './Container';

export default class Document extends Container{
  static validateSchema(schema, schemaPath) {
    if (!_.isPlainObject(schema.schema))
      return `Schema definition of document on "${schemaPath}" must have a "schema" param!`;
  }

  constructor(main) {
    super(main);

    this._lastChanges = {};
  }

  get type() {
    return 'document';
  }

  get loading() {
    return this.mold.$loading;
  }

  get saving() {
    return this.mold.$saving;
  }

  /**
   * Get changes from last save to the moment.
   * @returns {object}
   */
  get lastChanges() {
    return this._lastChanges;
  }

  $init(paths, schema) {
    super.$init(paths, schema);
  }

  getUrlParams() {
    return this._main.$$state.getUrlParams(this._moldPath);
  }

  setUrlParams(params) {
    this._main.$$state.setUrlParams(this._moldPath, params);
  }

  update(newState, eventData=undefined) {
    this._lastChanges = correctUpdatePayload(this._lastChanges, newState);
    super.update(newState, eventData);
  }

  /**
   * Load data from driver.
   * @param {object} metaParams
   * @returns {Promise}
   */
  load(metaParams=undefined) {
    this._main.$$state.update(this._storagePath, {$loading: true});
    return this._main.$$state.$$request.sendRequest(
        'get', this._moldPath, this._schema, undefined, metaParams, this.getUrlParams())
      .then((resp) => {
        // update mold with server response data
        this._main.$$state.update(this._storagePath, {$loading: false});

        this._main.$$state.update(this._storagePath, resp.body);
        this._lastChanges = {};

        return resp;
      }, (err) => {
        this._main.$$state.update(this._storagePath, {$loading: false});
        return Promise.reject(err);
      });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @param {object} metaParams
   * @returns {Promise}
   */
  put(newState=undefined, metaParams=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.update(this._storagePath, {$saving: true});

    const payload = omitUnsaveable(this._mold, this.schema);

    return this._main.$$state.$$request.sendRequest(
        'put', this._moldPath, this._schema, payload, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.update(this._storagePath, {
        ...resp.body,
        $saving: false,
      });
      this._lastChanges = {};

      return resp;
    }, (err) => {
      this._main.$$state.update(this._storagePath, {$saving: false});
      return Promise.reject(err);
    });
  }

  /**
   * Save actual state.
   * @param {object|undefined} newState
   * @param {object} metaParams
   * @returns {Promise}
   */
  patch(newState=undefined, metaParams=undefined) {
    if (newState) this.update(newState);
    this._main.$$state.update(this._storagePath, {$saving: true});

    const payload = omitUnsaveable(this._lastChanges, this.schema);

    return this._main.$$state.$$request.sendRequest(
      'patch', this._moldPath, this._schema, payload, metaParams, this.getUrlParams()).then((resp) => {
      // update mold with server response data
      this._main.$$state.update(this._storagePath, {
        ...resp.body,
        $saving: false,
      });
      this._lastChanges = {};

      return resp;
    }, (err) => {
      this._main.$$state.update(this._storagePath, {$saving: false});
      return Promise.reject(err);
    });
  }

  /**
   * Delete a document via documentsCollection.
   * You can't remove document that not inside a collection.
   * @param {object} metaParams
   * @return {Promise}
   */
  remove(metaParams=undefined) {
    const myDocumentsCollection = this.getParent();

    if (!myDocumentsCollection)
      this._main.$$log.fatal(`You can remove only from DocumentsCollection`);

    if (myDocumentsCollection.type != 'documentsCollection')
      this._main.$$log.fatal(`The parent of document isn't a DocumentsCollection. You can remove only from DocumentsCollection`);

    return myDocumentsCollection.remove(this.mold, metaParams);
  }

}
