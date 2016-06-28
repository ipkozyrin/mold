import _ from 'lodash';

import { splitLastParamPath } from '../helpers';

export default class Primitive {
  constructor(main) {
    this._main = main;

    this._main.events.on('mold.composition.update', (data) => {
      if (data.path.indexOf(this._root) === 0) this._updateMold();
    });
  }

  init(root, schema) {
    this._root = root;
    this.schema = schema;
    // mold is just a link to the composition
    this.mold = {};
    this._updateMold();

    var splits = splitLastParamPath(this._root);
    this.basePath = splits.basePath;
    this.paramPath = splits.paramPath;
  }

  /**
   * Get instance root
   * @returns {string}
   */
  getRoot() {
    return '' + this._root;
  }

  /**
   * Get value.
   * @returns {Promise}
   */
  get() {
    return new Promise((resolve, reject) => {
      this._main.state.getValue(this.basePath).then((resp) => {
        resolve({
          ...resp,
          coocked: _.get(resp.coocked, this.paramPath),
          // TODO: может добавить pathToParam???
        });
        this._updateMold();
      }, reject);
    });

    //return this._main.state.getValue(this._root);
  }

  /**
   * Set value
   * @param {string|number|boolean} value
   * @returns {Promise}
   */
  set(value) {
    let payload = _.set({}, this.paramPath, value);

    return new Promise((resolve, reject) => {
      this._main.state.setValue(this.basePath, payload).then((resp) => {
        resolve({
          ...resp,
          coocked: resp.coocked[this.paramPath],
          // TODO: может добавить pathToParam???
        });
        this._updateMold();
      }, reject);
    });

    //return this._main.state.setValue(this._root, value);
  }

  _updateMold() {
    this.mold = this._main.state.getComposition(this._root);
  }

}
