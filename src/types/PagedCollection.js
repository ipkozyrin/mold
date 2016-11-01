// Paged collection

import _ from 'lodash';

import { concatPath } from '../helpers';
import _TypeBase from './_TypeBase';

export default class PagedCollection extends _TypeBase {
  constructor(main) {
    super(main);

    this.type = 'pagedCollection';
  }

  $init(root, schema) {
    super.$init(root, schema);
  }

  /**
   * Get instance of page.
   * @param {number} pageNum
   * @returns {object} - instance of child
   */
  child(pageNum) {
    if (!_.isNumber(pageNum)) throw new Error(`The pageNum must be type of number!`);

    // TODO: test it

    var pathToChild = concatPath(this._root, pageNum);
    // get container instance
    var instance = this._main.schemaManager.getInstance(pageNum);
    // reinit container instance with correct path
    instance.$init(pathToChild, instance.schema);

    return instance;
  }

  /**
   * Get list with all the items of all the pages.
   */
  getFlat() {
    // TODO: наверное нужно пересчитать индексы $index или убрать их
    return _.flatMap(_.cloneDeep(this.mold));
  }

  /**
   * Get copy of list of pages.
   */
  getMold() {
    return _.cloneDeep(this.mold);
  }

  /**
   * add item to the end of last page.
   */
  addItem(item) {
    var pageNum;

    if (!_.isPlainObject(item))
      throw new Error(`You can add only item of plain object type!`);

    if (_.isEmpty(this.mold)) {
      pageNum = 0;
      this._main.state.addPage(this._root, [], pageNum);
    }
    else {
      pageNum = this.mold.length - 1;
    }

    // TODO: не допускать переполнение страницы - создавать новую, если эта переполненна

    this._main.state.addToEnd(concatPath(this._root, pageNum), item);
  }

  /**
   * Add list of items. They will be separate to pages
   * @param items
   */
  addManyItems(items) {
    // TODO: test it
    if (!_.isArray(items))
      throw new Error(`You can add only items of array type!`);

    // TODO: делать это поштучно - тогда поднимется много событий. Или всё разом???
  }

  /**
   * Add page to mold
   * @param {number} pageNum
   * @param {array} page
   */
  addPage(page, pageNum) {
    if (!_.isUndefined(pageNum) && !_.isNumber(pageNum)) throw new Error(`The pageNum must be type of number!`);
    if (!_.isArray(page)) throw new Error(`The page must be type of array!`);

    this._main.state.addPage(this._root, page, pageNum);
  }

  /**
   * Remove page
   * @param {number} pageNum
   */
  removePage(pageNum) {
    // TODO: !!!!
  }
}
