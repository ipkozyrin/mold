import _ from 'lodash';

import Storage from './Storage';
import TypeManager from './TypeManager';
import SchemaManager from './SchemaManager';
import NodeManager from './NodeManager';
import DriverManager from './DriverManager';
import Request from './Request';
import defaultConfig from './defaultConfig';

import Container from './nodes/Container';
import Driver from './nodes/Driver';
import StateType from './nodes/State';
import Document from './nodes/Document';
import Catalogue from './nodes/Catalogue';


export default class Main {
  constructor(schema, givenCconfig) {
    this.config = this._mergeConfig(givenCconfig);
    this.log = this._getLogger(this.config.logger);
    this.request = new Request(this);
    this.nodeManager = new NodeManager(this);
    this.driverManager = new DriverManager(this);
    this.typeManager = new TypeManager(this);
    this.schemaManager = new SchemaManager(this);
    this.storage = new Storage();

    this._init(schema);
  }

  _init(schema) {
    // register base types
    this.nodeManager.register('container', Container);
    this.nodeManager.register('driver', Driver);
    this.nodeManager.register('state', StateType);
    this.nodeManager.register('document', Document);
    this.nodeManager.register('catalogue', Catalogue);

    // TODO: run plugins

    // initialize
    this.driverManager.init();
    this.schemaManager.init();
    this.schemaManager.setSchema(schema);
    this.storage.$init({});
  }

  _mergeConfig(givenCconfig) {
    return _.defaultsDeep({ ...givenCconfig }, defaultConfig);
  }

  _getLogger(externalLogger) {
    let logger = externalLogger;

    if (!externalLogger) {
      // use default logger
      const Log = require('./DefaultLoger');
      logger = new Log({ silent: this._config.silent });
    }

    return logger;
  }

}
