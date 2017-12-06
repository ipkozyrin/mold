DriverManager = require('../../src/DriverManager').default


describe 'Unit. DriverManager.', ->
  describe 'driver on the root.', ->
    beforeEach () ->
      @main = {
        $$log: { fatal: sinon.spy() }
      }

      @driver = {
        init: sinon.spy()
      }

      testSchema = () =>
        {
          driverRoot: {
            type: 'driver'
            driver: @driver
            schema: {
            }
          }
        }

      @testSchema = testSchema()
      @driverManager = new DriverManager(@main);

    it "collect drivers", ->
      @driverManager.collectDrivers(@testSchema)

      sinon.assert.calledOnce(@driver.init)
      sinon.assert.calledWith(@driver.init, 'driverRoot', @main)

      assert.deepEqual(@driverManager._drivers, {
        'driverRoot': @driver
      })

    it "don't register driver twice", ->
      @driverManager.collectDrivers(@testSchema)
      @driverManager.collectDrivers(@testSchema)

      sinon.assert.calledOnce(@driver.init)

  describe 'two level driver', ->
    beforeEach () ->
      @main = {
        $$log: { fatal: sinon.spy() }
      }

      @driver = {
        init: sinon.spy()
      }
      @driver2 = {
        init: sinon.spy()
      }

      testSchema = () =>
        {
          driverRoot: {
            type: 'driver'
            driver: @driver
            schema: {
              container: {
                type: 'container'
                driver: @driver2
              }
            }
          }
        }

      @testSchema = testSchema()
      @driverManager = new DriverManager(@main);

    it "it's disallowed to have 2 drivers in one branch", ->
