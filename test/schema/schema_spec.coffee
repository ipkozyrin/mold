mold = require('index.js')
logger = require('log.js')


# TODO: test composition after set schema

describe 'schema', ->
  it 'another require of mold must return same value of first require', ->
    mold.schema('param1', mold.number(5));
    anotherMold = require('index.js')
    assert.deepEqual(anotherMold.getSchema('param1'), {type: 'number', value: 5})

  # TODO: test schema validation

  it 'get/set full schema', ->
    mold.$$reset()
    mold.schema('/', mold.number(5));
    assert.deepEqual(mold.getSchema(), {type: 'number', value: 5})

  it 'get/set schema by path', ->
    mold.schema('testParam', mold.number(5));
    assert.deepEqual(mold.getSchema('testParam'), {type: 'number', value: 5})

  it 'getSchema - get not existent param', ->
    assert.isUndefined(mold.getSchema('notExistent'))

  it 'getSchema - wrong argument', ->
    spy = sinon.spy()
    spy()
    assert(spy.called)


    myAPI = { method: -> }
    mock = sinon.mock(myAPI)
    mock.expects('method').once().returns(42)
    assert.equal(myAPI.method(), 42)
    mock.verify()


#    moldMock = sinon.mock(logger)
#    mock.expects('error').once().returns(42)
#    mold.getSchema(null)
#    assert(mold.$log.error.should.have.been.called)

    #console.log(111111, mold.$log.error)

    mold.getSchema(null)

    # TODO: должен был вызваться mold.$log.error
    #assert.isUndefined(mold.getSchema(null))


describe 'full struct and basic values', ->
  beforeEach ->
    this.schema = mold.struct {
      numberValue: mold.number(5),
      booleanValueTrue: mold.boolean(true),
      booleanValueFalse: mold.boolean(false),
      stringValue: mold.string('str value'),
      innerStruct: mold.struct {
        innerStructNumber: mold.number(7)
      }
    }

  it 'root/first', ->
    mold.schema('first', this.schema)
    assert.deepEqual mold.getSchema('first'), {
      type: 'struct'
      children: {
        numberValue: {type: 'number', value: 5}
        booleanValueTrue: {type: 'boolean', value: true}
        booleanValueFalse: {type: 'boolean', value: false}
        stringValue: {type: 'string', value: 'str value'}
        innerStruct: {
          type: 'struct'
          children: {
            innerStructNumber: {
              type: 'number'
              value: 7
            }
          }
        }
      }
    }

  it 'first.numberValue', ->
    mold.schema('first', this.schema)
    assert.deepEqual(mold.getSchema('first.numberValue'), {type: 'number', value: 5})


