mutate = require('../../src/mutate').default

describe 'Unit. mutate.', ->
  it 'primitives', ->
    storage =
      container:
        stringValue: 'old value'
        numberValue: 1
        boolValue: false
        arrayValue: ['val1']

    newData =
      stringValue: 'new value'
      numberValue: 5
      boolValue: true
      arrayValue: ['val1', 'val2']
      newValue: 'new'

    updates = mutate(storage, 'container', newData)

    assert.deepEqual storage, { container: newData }

    assert.deepEqual updates, [
      [
        'container.stringValue'
        'new value'
        'changed'
      ]
      [
        'container.numberValue'
        5
        'changed'
      ]
      [
        'container.boolValue'
        true
        'changed'
      ]
      [
        'container.arrayValue'
        ['val1', 'val2']
        'changed'
      ]
      [
        'container.newValue'
        'new'
        'changed'
      ]
      [
        'container'
        newData
        'changed'
      ]
    ]

  it 'unchanged values - nothing to change', ->
    storage =
      container:
        unchangedValue: 'old value'

    newData =
      unchangedValue: 'old value'

    updates = mutate(storage, 'container', newData)

    assert.deepEqual storage, { container: newData }

    assert.deepEqual updates, [
      [
        'container.unchangedValue'
        'old value'
        'unchanged'
      ]
      [
        'container'
        newData
        'unchanged'
      ]
    ]

  it 'unchanged values - change partly', ->
    storage =
      container:
        unchangedValue: 'old value'
        changedValue: 'old value'

    newData =
      unchangedValue: 'old value'
      changedValue: 'new value'

    updates = mutate(storage, 'container', newData)

    assert.deepEqual storage, { container: newData }

    assert.deepEqual updates, [
      [
        'container.unchangedValue'
        'old value'
        'unchanged'
      ]
      [
        'container.changedValue'
        'new value'
        'changed'
      ]
      [
        'container'
        newData
        'changed'
      ]
    ]

  it 'untouched value', ->
    storage =
      container:
        untouchedValue: 'untouched value'
        changedValue: 'old value'

    newData =
      changedValue: 'new value'

    updates = mutate(storage, 'container', newData)

    assert.deepEqual storage, {
      container:
        untouchedValue: 'untouched value'
        changedValue: 'new value'
    }

    assert.deepEqual updates, [
      [
        'container.changedValue'
        'new value'
        'changed'
      ]
      [
        'container'
        {
          untouchedValue: 'untouched value'
          changedValue: 'new value'
        }
        'changed'
      ]
    ]
    
  it 'nested container', ->
    storage =
      container:
        stringValue: 'old value'
        nested:
          nestedString: 'old nested value'

    newData =
      stringValue: 'new value'
      nested:
        nestedString: 'new nested value'

    updates = mutate(storage, 'container', newData)

    assert.deepEqual storage, { container: newData }

    assert.deepEqual updates, [
      [
        'container.stringValue'
        'new value'
        'changed'
      ]
      [
        'container.nested.nestedString'
        'new nested value'
        'changed'
      ]
      [
        'container.nested'
        {
          nestedString: 'new nested value'
        }
        'changed'
      ]
      [
        'container'
        newData
        'changed'
      ]
    ]

# TODO: test from server returns new value, like _id, _rev
# TODO: test $index
# TODO: test update to root
# TODO: test collection init
# TODO: test collection add
# TODO: test collection remove
