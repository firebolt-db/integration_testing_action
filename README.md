# Integration testing setup action
This action is designed to simplify integration testing for applications that use Firebolt database. This action will create a database, an engine and start the engine. Accepted parameters are

- **firebolt-username** - Username to use for authentication
- **firebolt-password** - Password to use for authentication
- **region [Optional]** - Region to create a database and engine in
- **instance-type [Optional]** - Engine instance type
- **db_suffix [Optional]** - A suffix to append to database name
- **engine-scale [Optional]** - Scale of an engine
- **api-endpoint [Optional]** -  Environment endpoint to use to connect (Default: `api.app.firebolt.io`)
