mold = require('../../src/index').default

describe.only 'Functional. Document type.', ->
  beforeEach () ->
    testSchema = () ->
      document: {
        type: 'document'
        schema: {
          boolParam: {type: 'boolean'}
          stringParam: {type: 'string'}
          numberParam: {type: 'number'}
          arrayParam: {
            type: 'array'
            itemsType: 'number'
          }
          collection: {
            type: 'collection'
            item: {
              id: { type: 'number', key: true }
              itemStringParam: {type: 'string'}
            }
          }
          nested: {
            type: 'assoc'
            items: {
              nestedStringParam: {type: 'string'}
            }
          }
        }
      }

    this.testValues = {
      boolParam: true,
      stringParam: 'newValue',
      numberParam: 5,
#      arrayParam: ['value1'],
#      nested:
#        nestedStringParam: 'nestedValue'
    }

    @testSchema = testSchema()
    @moldPath = 'document'
    @mold = mold( {silent: true}, @testSchema )
    @document = this.mold.get(@moldPath)
    @document.$init(@moldPath, @testSchema.document)

  it 'load()', ->
    _.set(@mold.$$driverManager.$defaultMemoryDb, 'document', @testValues)

    assert.isFalse(@document.loading)

    promise = this.document.load()

    assert.isTrue(@document.loading)

    promise
      .then (response) =>
        assert.deepEqual(response.body, @testValues)
        assert.deepEqual(@document.mold, @testValues)
        assert.isFalse(@document.loading)

  it 'put()', ->
    _.set(@mold.$$driverManager.$defaultMemoryDb, 'document', @testValues)

    assert.isFalse(@document.saving)

    newData = {
      boolParam: false,
      stringParam: 'overlay',
      stringParam: 'overlay',
      numberParam: 7,
    }
    promise = this.document.put(newData)

    assert.isTrue(@document.saving)

    promise
      .then (response) =>
        assert.deepEqual(response.body, newData)
        assert.deepEqual(@document.mold, newData)
        assert.isFalse(@document.saving)



# TODO: test path
# TODO: test put
# TODO: test delete
# TODO: test custom action


#  it 'update() and put()', ->
#    this.document.update(this.testValues)
#    expect(this.document.put()).to.eventually
#    .property('body').deep.equal(this.testValues)
#
#  it "put(newState)", ->
#    expect(this.document.put(this.testValues)).to.eventually
#    .property('body').deep.equal(this.testValues)
#
#  it "saving", (done) ->
#    assert.isUndefined(this.document.mold.$saving)
#    promise = this.document.put()
#    assert.isTrue(this.document.mold.$saving)
#
#    expect(promise).to.eventually.notify =>
#      expect(Promise.resolve(this.document.mold.$saving)).to.eventually
#      .equal(false)
#      .notify(done)
#
#  it "clear()", ->
#    this.document.update({
#      stringParam: 'newValue',
#      numberParam: 5,
#    })
#    this.document.clear();
#    assert.deepEqual(this.document.mold, {})
#
#
#  it "remove", (done) ->
#    testSchema = () ->
#      documentsCollection:
#        type: 'documentsCollection'
#        item:
#          type: 'document'
#          schema:
#            $id: {type: 'number', primary: true}
#
#    testDoc = {
#      $id: 0,
#      $pageIndex: 0,
#      $index: 0,
#    }
#
#    moldMain = mold( {silent: true}, testSchema() )
#    document = moldMain.child('documentsCollection[0]')
#
#    _.set(moldMain.$$driverManager.$defaultMemoryDb, 'documentsCollection', [testDoc])
#    _.set(moldMain.$$state._storage._storage, 'documentsCollection.action.load[0]', [testDoc])
#    _.extend(_.get(moldMain.$$state._storage._storage, 'documentsCollection.documents.0'), testDoc)
#
#    assert.deepEqual(moldMain.$$driverManager.$defaultMemoryDb.documentsCollection, [testDoc])
#    assert.deepEqual(moldMain.$$state._storage._storage.documentsCollection.action.load, [[testDoc]])
#    assert.deepEqual(document.mold, testDoc)
#
#    promise = document.remove()
#
#    assert.isTrue(document.mold.$deleting)
#
#    expect(promise).to.eventually.notify =>
#      expect(Promise.all([
#        expect(Promise.resolve(document.mold.$deleting)).to.eventually.equal(false)
#        expect(Promise.resolve(document.mold.$deleted)).to.eventually.equal(true)
#        expect(Promise.resolve(moldMain.$$state._storage._storage.documentsCollection.action.load)).to.eventually.deep.equal([[]])
#        # don't delete form documents
#        expect(Promise.resolve(moldMain.$$state._storage._storage.documentsCollection.documents['0'].$id)).to.eventually.equal(0)
#        expect(Promise.resolve(moldMain.$$driverManager.$defaultMemoryDb.documentsCollection)).to.eventually.deep.equal([])
#      ])).to.eventually.notify(done)
#
#  it "try to save unsaveable", ->
#    testSchema = () ->
#      document:
#        type: 'document'
#        schema:
#          $id: {type: 'number'}
#          unsaveable: {type: 'string', saveable: false}
#
#    moldMain = mold( {silent: true}, testSchema() )
#    document = moldMain.child('document')
#
#    expect(document.put({$id: 0, unsaveable: 'newValue'})).to.eventually
#    .property('request').property('payload').deep.equal({
#      $id: 0,
#    })
#
#  it "update read only - it throws an error", ->
#    testSchema = () ->
#      document:
#        type: 'document'
#        schema:
#          $id: {type: 'number', readOnly: true}
#
#    moldMain = mold( {silent: true}, testSchema() )
#    document = moldMain.child('document')
#
#    assert.throws(document.update.bind(document, {$id: 5}))
