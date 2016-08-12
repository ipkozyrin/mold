mold = require('../../src/index')

testSchema = () ->
  container:
    stringParam:
      type: 'string'
  nested:
    container:
      stringParam:
        type: 'string'
      numberParam:
        type: 'number'
  collection:
    type: 'collection'
    item:
      id: {type: 'number', primary: true}
      name: {type: 'string'}

describe 'Functional. Events.', ->
  beforeEach () ->
    this.mold = mold.initSchema( {}, testSchema() )
    this.container = this.mold.instance('container')
    this.collection = this.mold.instance('collection')
    this.primitive = this.container.child('stringParam')
    this.handler = sinon.spy();


  describe 'mold.update', ->
    beforeEach () ->
      this.mold = mold.initSchema( {}, testSchema() )
      this.container = this.mold.instance('container')
      this.collection = this.mold.instance('collection')
      this.primitive = this.container.child('stringParam')
      this.handler = sinon.spy();

    it 'mold.update - on setMold', ->
      this.mold.state.onMoldUpdate(this.handler)
      this.primitive.setMold('new value')

      expect(this.handler).to.have.been.calledOnce
      expect(this.handler).to.have.been.calledWith({
        path: 'container.stringParam'
        action: 'change'
      })

    it 'mold.update - on addMold and removeMold', ->
      this.mold.state.onMoldUpdate(this.handler)
      this.collection.addMold({id:1, name: 'value1'})

      expect(this.handler).to.have.been.calledWith({
        path: 'collection'
        action: 'add'
      })

      this.collection.removeMold({id:1, name: 'value1', $index: 0})

      expect(this.handler).to.have.been.calledWith({
        path: 'collection'
        action: 'remove'
      })

      expect(this.handler).to.have.been.calledTwice

    # TODO: test events after load and after unchanged value and after change 2 values



  it 'primitive onChange and offChange', () ->
    this.primitive.onChange(this.handler)
    this.primitive.setMold('new value')

    assert.deepEqual(this.mold.state._handlers['container.stringParam'], [this.handler])
    expect(this.handler).to.have.been.calledOnce
    expect(this.handler).to.have.been.calledWith({
      path: 'container.stringParam'
      isTarget: true
      target: {
        path: 'container.stringParam'
        action: 'change'
        #value: 'new value'
      }
    })

    this.primitive.offChange(this.handler)
    this.primitive.setMold('very new value')
    assert.deepEqual(this.mold.state._handlers['container.stringParam'], [])
    expect(this.handler).to.have.been.calledOnce

  it 'destroy primitive', () ->
    this.primitive.onChange(this.handler)
    this.primitive.setMold('new value')

    assert.equal(this.primitive.mold, 'new value')

    this.primitive.destroy()

    assert.deepEqual(this.mold.state._handlers['container.stringParam'], [])

    assert.equal(this.primitive.mold, null)

  it 'destroy container - it must be clear', ->
    this.container.setMold('stringParam', 'new value')

    assert.deepEqual(this.container.mold, {stringParam: 'new value'})

    this.container.destroy()

    assert.deepEqual(this.container.mold, {stringParam: null})

  it 'destroy collection - it must be clear', ->
    this.collection.addMold({id:1 , name: 'value1'})

    assert.deepEqual(this.collection.mold, [{id:1 , name: 'value1', $index: 0, $isNew: true}])

    this.collection.destroy()

    assert.deepEqual(this.collection.mold, [])

# TODO: должен работать после того как сделаю bubble

#  it 'container onChange and offChange', () ->
#    this.container.onChange(this.handler)
#    this.container.setMold('stringParam', 'new value')
#
#    assert.deepEqual(this.mold.state._handlers['inMemory'], [this.handler])
#    expect(this.handler).to.have.been.calledOnce
#    expect(this.handler).to.have.been.calledWith({
#      path: 'inMemory'
#      isTarget: false
#      target: {
#        path: 'inMemory.stringParam'
#        action: 'change'
#        value: 'new value'
#      }
#    })
#
#    this.container.offChange(this.handler)
#    this.container.setMold('stringParam', 'very new value')
#    assert.deepEqual(this.mold.state._handlers['inMemory'], [])
#    expect(this.handler).to.have.been.calledOnce



  it 'bubbling on primitive', () ->
    containerHandler = sinon.spy();
    this.primitive.onChange(this.handler)
    this.container.onChange(containerHandler)

    this.primitive.setMold('new value')

    expect(this.handler).to.have.been.calledOnce
    expect(containerHandler).to.have.been.calledOnce

    expect(this.handler).to.have.been.calledWith({
      path: 'container.stringParam'
      isTarget: true
      target: {
        path: 'container.stringParam'
        action: 'change'
      }
    })
    expect(containerHandler).to.have.been.calledWith({
      path: 'container'
      isTarget: false
      target: {
        path: 'container.stringParam'
        action: 'change'
      }
    })

  it 'bubbling on container', () ->
    nested = this.mold.instance('nested')
    nestedContainer = this.mold.instance('nested.container')
    stringPrimitive = nestedContainer.child('stringParam')
    numberPrimitive = nestedContainer.child('numberParam')

    nestedHandler = sinon.spy();
    containerHandler = sinon.spy();
    stringHandler = sinon.spy();
    numberHandler = sinon.spy();

    nested.onChange(nestedHandler)
    nestedContainer.onChange(containerHandler)
    stringPrimitive.onChange(stringHandler)
    numberPrimitive.onChange(numberHandler)

    nestedContainer.setMold({
      stringParam: 'new value'
      numberParam: 5
    })

    #expect(nestedHandler).to.have.been.calledOnce
    #expect(containerHandler).to.have.been.calledOnce
    expect(stringHandler).to.have.been.calledOnce
    expect(numberHandler).to.have.been.calledOnce

#    expect(containerHandler).to.have.been.calledWith({
#      path: 'nested.container'
#      isTarget: false
#      target: {
#        path: 'nested.container.stringParam'
#        action: 'change'
#      }
#    })
    expect(stringHandler).to.have.been.calledWith({
      path: 'nested.container.stringParam'
      isTarget: true
      target: {
        path: 'nested.container.stringParam'
        action: 'change'
      }
    })
    expect(numberHandler).to.have.been.calledWith({
      path: 'nested.container.numberParam'
      isTarget: true
      target: {
        path: 'nested.container.numberParam'
        action: 'change'
      }
    })

  it 'bubbling on collection', () ->


# TODO: проверить что событие не поднимается если значение по факту не изменилось
# TODO: проверить что у контейнера поднимится событие, если мы устанавливаем значение через примитив
# TODO: проверить коллекции
# TODO: проверить баблинг
