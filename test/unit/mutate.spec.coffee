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

    assert.deepEqual(storage, { container: newData })

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

    assert.deepEqual(storage, { container: newData })

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

    assert.deepEqual(storage, { container: newData })

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

  it 'server returns _id additionally', ->
    storage =
      container:
        changedValue: 'old value'

    newData =
      changedValue: 'new value'
      _id: 'container'

    updates = mutate(storage, 'container', newData)

    assert.deepEqual storage, {
      container:
        changedValue: 'new value'
        _id: 'container'
    }

    assert.deepEqual updates, [
      [
        'container.changedValue'
        'new value'
        'changed'
      ]
      [
        'container._id'
        'container'
        'changed'
      ]
      [
        'container'
        newData
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

    assert.deepEqual(storage, { container: newData })

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

  it 'update from root', ->
    storage =
      container:
        stringValue: 'old value'

    newData =
      container:
        stringValue: 'new value'

    updates = mutate(storage, '', newData)

    assert.deepEqual(storage, newData)

    assert.deepEqual updates, [
      [
        'container.stringValue'
        'new value'
        'changed'
      ]
      [
        'container'
        newData.container
        'changed'
      ]
      [
        ''
        newData
        'changed'
      ]
    ]

  it 'collection init (add from server)', ->
    storage =
      collection: []

    newData = [
      {
        id: 5
        name: 'new item'
      }
    ]

    updates = mutate(storage, 'collection', newData)

    assert.deepEqual(storage, { collection: [
      {
        $index: 0
        id: 5
        name: 'new item'
      }
    ] })

    assert.deepEqual updates, [
      [
        'collection.0'
        {
          $index: 0,
          id: 5
          name: 'new item'
        }
        'added'
      ]
      [
        'collection'
        [
          {
            $index: 0,
            id: 5
            name: 'new item'
          }
        ]
        'changed'
      ]
    ]


  it 'collection remove and add', ->
    storage =
      collection: [
        {
          $index: 0,
          id: 5
          name: 'to remove item'
        }
        {
          $index: 1,
          id: 6
          name: 'old item'
        }
      ]

    newData = [
      {
        id: 6
        name: 'old item'
      }
      {
        id: 7
        name: 'new item'
      }
    ]

    updates = mutate(storage, 'collection', newData)

    assert.deepEqual(storage, { collection: [
      {
        $index: 0,
        id: 6
        name: 'old item'
      }
      {
        $index: 1,
        id: 7
        name: 'new item'
      }
    ] })

    # TODO: check updates
#    assert.deepEqual updates, [
#      [
#        'collection.0'
#        {
#          $index: 0,
#          id: 5
#          name: 'to remove item'
#        }
#        'removed'
#      ]
#      [
#        'collection.1'
#        {
#          $index: 1,
#          id: 7
#          name: 'new item'
#        }
#        'added'
#      ]
#      [
#        'collection'
#        [
#          {
#            $index: 0,
#            id: 6
#            name: 'old item'
#          }
#          {
#            $index: 1,
#            id: 7
#            name: 'new item'
#          }
#        ]
#        'changed'
#      ]
#    ]

  it 'collection item change on updating collection', ->
    storage =
      collection: [
        {
          $index: 0
          id: 5
          name: 'old item'
        }
      ]

    newData = [
      {
        id: 5
        name: 'new item'
      }
    ]

    updates = mutate(storage, 'collection', newData)

    assert.deepEqual(storage, { collection: [
      {
        $index: 0
        id: 5
        name: 'new item'
      }
    ] })

    assert.deepEqual updates, [
      [
        'collection.0.id'
        5
        'unchanged'
      ]
      [
        'collection.0.name'
        'new item'
        'changed'
      ]
      [
        'collection.0'
        {
          $index: 0,
          id: 5
          name: 'new item'
        }
        'changed'
      ]
      [
        'collection'
        [
          {
            $index: 0,
            id: 5
            name: 'new item'
          }
        ]
        'changed'
      ]
    ]

  it 'collection item change on updating item himself via container "collection.0"', ->
    storage =
      collection: [
        {
          $index: 0
          id: 5
          name: 'old item'
        }
      ]

    newData = {
      id: 5
      name: 'new item'
    }

    updates = mutate(storage, 'collection.0', newData)

    assert.deepEqual(storage, { collection: [
      {
        $index: 0
        id: 5
        name: 'new item'
      }
    ] })

    assert.deepEqual updates, [
      [
        'collection.0.id'
        5
        'unchanged'
      ]
      [
        'collection.0.name'
        'new item'
        'changed'
      ]
      [
        'collection.0'
        {
          $index: 0,
          id: 5
          name: 'new item'
        }
        'changed'
      ]
    ]

  it 'collection item change on updating item himself via primitive "collection.0.name"', ->
    storage =
      collection: [
        {
          $index: 0
          id: 5
          name: 'old item'
        }
      ]

    newData = 'new item'

    updates = mutate(storage, 'collection.0.name', newData)

    assert.deepEqual(storage, { collection: [
      {
        $index: 0
        id: 5
        name: 'new item'
      }
    ] })

    assert.deepEqual updates, [
      [
        'collection.0.name'
        'new item'
        'changed'
      ]
    ]