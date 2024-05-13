# Integration testing setup action
This action is designed to simplify integration testing for applications that use Firebolt database. This action will create a database, an engine and start the engine. Accepted parameters are

- **firebolt-client-id** - Service account it to use for authentication
- **firebolt-client-secret** - Service account secret to use for authentication
- **instance-type [Optional]** - Engine instance type
- **db_suffix [Optional]** - A suffix to append to database name
- **engine-scale [Optional]** - Scale of an engine
- **api-endpoint [Optional]** -  Environment endpoint to use to connect (Default: `api.app.firebolt.io`)
- **engine-version [Optional]** - Setup a specific engine version
- **region [Optional]** - Deprecated

## Release procedure
Release is done by creating release in GitHub with a tag. Use [semantic versioning](https://semver.org/) to determine how a tag name. In general it should look like `v1.0.1`.
Once a release is created a relevant GitHub action will bump the major version tag to point at your newly created tag. e.g. if you've created v1.2.3, GitHub will run and point v1 -> v1.2.3. This ensures all calls to this action with a major version tag are updated to use the latest release.
