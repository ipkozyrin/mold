mold = require('../../src/index').default

describe 'Functional. Document type.', ->
  beforeEach () ->
    testSchema = () ->
      document:
        type: 'document'
        schema:
          boolParam: { type: 'boolean' }
          stringParam: { type: 'string'}
          numberParam: { type: 'number' }
          arrayParam: { type: 'array' }
          nested:
            type: 'container'
            schema:
              nestedStringParam:
                type: 'string'

    this.testValues = {
      boolParam: true,
      stringParam: 'newValue',
      numberParam: 5,
      arrayParam: ['value1'],
      nested:
        nestedStringParam: 'nestedValue'
    }

    this.testSchema = testSchema()
    this.mold = mold( {silent: true}, this.testSchema )
    this.document = this.mold.child('document')

  it 'load() and check mold', (done) ->
    _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'document', this.testValues)

    expect(this.document.load()).to.eventually.notify =>
      expect(Promise.resolve(this.document.mold)).to.eventually
      .deep.equal(_.defaults(_.clone(this.testValues), {$loading: false}))
      .notify(done)

  it 'load() and check response', ->
    _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'document', this.testValues)

    expect(this.document.load()).to.eventually.property('body').deep.equal(this.testValues)

  it 'update() and put()', ->
    this.document.update(this.testValues)
    expect(this.document.put()).to.eventually
    .property('body').deep.equal(this.testValues)

  it "put(newState)", ->
    expect(this.document.put(this.testValues)).to.eventually
    .property('body').deep.equal(this.testValues)

  it "loading", (done) ->
    _.set(this.mold.$$schemaManager.$defaultMemoryDb, 'document', this.testValues)

    assert.isUndefined(this.document.mold.$loading)
    promise = this.document.load()
    assert.isTrue(this.document.mold.$loading)

    expect(promise).to.eventually.notify =>
      expect(Promise.resolve(this.document.mold.$loading)).to.eventually
      .equal(false)
      .notify(done)

  it "saving", (done) ->
    assert.isUndefined(this.document.mold.$saving)
    promise = this.document.put()
    assert.isTrue(this.document.mold.$saving)

    expect(promise).to.eventually.notify =>
      expect(Promise.resolve(this.document.mold.$saving)).to.eventually
      .equal(false)
      .notify(done)
