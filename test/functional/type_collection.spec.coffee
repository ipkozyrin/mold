mold = require('../../src/index')
Memory = require('../../src/drivers/Memory').default

testSchema = (memory) ->
  inMemory: memory({}, {
    collectionParam: document: {}, schema: {
      type: 'collection'
      item: {
        id: {type: 'number', primary: true}
        name: {type: 'string'}
      }
    }
  })

testValues = [
  {
    id: 0
    name: 'name1'
  },
  {
    id: 1
    name: 'name2'
  },
]

describe 'Functional. Collection type.', ->

  describe 'init, child(), child(num), child(subpath)', ->
    beforeEach () ->
      this.memoryDb = {};
      memory = new Memory({db: this.memoryDb});
      this.mold = mold.initSchema( {}, testSchema(memory.schema) )
      this.collectionParam = this.mold.instance('inMemory.collectionParam')

    it 'init value', ->
      assert.deepEqual(this.collectionParam.mold, [])
      
    it 'init via container', ->
      container = this.mold.instance('inMemory')
      container.setMold('collectionParam', testValues)
      assert.deepEqual(container.mold.collectionParam, testValues)
      assert.deepEqual(this.collectionParam.mold, testValues)
      
    it 'child(0)', ->
      this.collectionParam.addMold({name: 'name0'})
      assert.equal(this.collectionParam.child(0).mold.name, 'name0')

    it 'child(0).child("name") after add', ->
      this.collectionParam.addMold({name: 'name0'})
      collectionItem = this.collectionParam.child(0)
      primitiveOfName = collectionItem.child('name')
      assert.equal(primitiveOfName.mold, 'name0')

    it 'child(0).child("name") after get collection', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
      expect(this.collectionParam.get()).to.eventually.notify =>
        collectionItem = this.collectionParam.child(0)
        primitiveOfName = collectionItem.child('name')
        expect(Promise.resolve(primitiveOfName.mold)).to.eventually
        .equal('name1')
        .notify(done)

    it 'child(0).child("name") after get item', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
      collectionItem = this.collectionParam.child(0)

      expect(collectionItem.get()).to.eventually.notify =>
        primitiveOfName = collectionItem.child('name')
        expect(Promise.resolve(primitiveOfName.mold)).to.eventually
        .equal('name1')
        .notify(done)

  describe 'get(), get(num), get(subpath)', ->
    beforeEach () ->
      this.memoryDb = {};
      memory = new Memory({db: this.memoryDb});
      this.mold = mold.initSchema( {}, testSchema(memory.schema) )
      this.collectionParam = this.mold.instance('inMemory.collectionParam')

    it 'get() - check promise', ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
      expect(this.collectionParam.get()).to.eventually
      .property('coocked').deep.equal([testValues[0]])

    it 'get() - check mold', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
      expect(this.collectionParam.get()).to.eventually.notify =>
        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
        .deep.equal([
          {id: 0, name: 'name1', $index: 0},
        ])
        .notify(done)

    it 'get(0) - check promise', ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
      expect(this.collectionParam.get(0)).to.eventually
      .property('coocked').deep.equal(testValues[0])

    it 'get(0) - check mold', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
      expect(this.collectionParam.get(0)).to.eventually.notify =>
        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
        .deep.equal([{id: 0, name: 'name1', $index: 0}])
        .notify(done)

    # TODO: do it!
  #  it 'get("0.name") - check promise', ->
  #    this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
  #    expect(this.collectionParam.get('0.name')).to.eventually
  #    .property('coocked').deep.equal(testValues[0].name)

  describe 'addMold({...}), removeMold({...})', ->
    beforeEach () ->
      this.memoryDb = {};
      memory = new Memory({db: this.memoryDb});
      this.mold = mold.initSchema( {}, testSchema(memory.schema) )
      this.collectionParam = this.mold.instance('inMemory.collectionParam')

    it 'addMold() - check mold', ->
      newItem = {name: 'name3'}
      this.collectionParam.addMold(newItem)
      assert.deepEqual(this.collectionParam.mold, [
        {name: 'name3', $isNew: true, $index: 0},
      ])

    it 'addMold() - after get', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}

      newItem = {name: 'name3'}
      expect(this.collectionParam.get()).to.eventually.notify =>
        this.collectionParam.addMold(newItem)
        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
        .deep.equal([
          {name: 'name3', $isNew: true, $index: 0},
          {id: 0, name: 'name1', $index: 1},
        ])
        .notify(done)

    it 'removeMold() - after get', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0], testValues[1]]}

      expect(this.collectionParam.get()).to.eventually.notify =>
        this.collectionParam.removeMold({$index: 0})
        expect(Promise.resolve(this.collectionParam.mold)).to.eventually
        .deep.equal([
          {id: 1, name: 'name2', $index: 0},
        ])
        .notify(done)

  describe 'save() added, save() removed', ->
    beforeEach () ->
      this.memoryDb = {};
      memory = new Memory({db: this.memoryDb});
      this.mold = mold.initSchema( {}, testSchema(memory.schema) )
      this.collectionParam = this.mold.instance('inMemory.collectionParam')

    it 'save() added - check promise', ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
      this.collectionParam.addMold({name: 'name3'})

      expect(this.collectionParam.save()).to.eventually
      .property(0).property('resp').property('coocked').deep.equal({id: 1, name: 'name3'})

    it 'save() added - check memory', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
      this.collectionParam.addMold({name: 'name3'})

      expect(this.collectionParam.save()).to.eventually.notify =>
        expect(Promise.resolve(this.memoryDb)).to.eventually
        .deep.equal({inMemory: {collectionParam: [
          testValues[0],
          {name: 'name3', id: 1}
        ]}})
        .notify(done)

    it 'save() added - check unsaved', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0]]}
      this.collectionParam.addMold({name: 'name3'})

      expect(this.collectionParam.save()).to.eventually.notify =>
        expect(Promise.resolve(this.memoryDb)).to.eventually.notify =>
          expect(Promise.resolve(this.collectionParam._main.state._addedUnsavedItems)).to.eventually
          .deep.equal({})
          .notify(done)

    it 'save() removed - check memory', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0], testValues[1]]}
      expect(this.collectionParam.get()).to.eventually.notify =>
        this.collectionParam.removeMold(this.collectionParam.mold[0])

        expect(this.collectionParam.save()).to.eventually.notify =>
          expect(Promise.resolve(this.memoryDb)).to.eventually
          .deep.equal({inMemory: {collectionParam: [testValues[1]]}})
          .notify(done)

    it 'save() removed - check unsaved', (done) ->
      this.memoryDb.inMemory = {collectionParam: [testValues[0], testValues[1]]}
      expect(this.collectionParam.get()).to.eventually.notify =>
        this.collectionParam.removeMold(this.collectionParam.mold[0])

        expect(this.collectionParam.save()).to.eventually.notify =>
          expect(Promise.resolve(this.collectionParam._main.state._removedUnsavedItems)).to.eventually
          .deep.equal({})
          .notify(done)

#  it 'Many manupulations with collection', (done) ->
#    newItem = {id: 3, name: 'name3'}
#    expect(this.collectionParam.add(testValues[0])).notify =>
#      expect(this.collectionParam.add(testValues[1])).notify =>
#        expect(this.collectionParam.add(newItem)).notify =>
#          expect(this.collectionParam.remove({id: 2})).notify =>
#            #this.collectionParam.child(1).set('name', 'new name');
#            assert.deepEqual _.compact(this.collectionParam.mold), [
#              {
#                id: 1
#                name: 'name1'
#                $index: 1
#              }
#              {
#                id: 3
#                name: 'name3'
#                $index: 3
#              }
#            ]
#            done()
