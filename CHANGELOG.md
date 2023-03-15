# Change Log

All notable changes to this project will be documented in this file.

## [1.3.1]

### Fixes
* Fixed [compatibility issue with mysql8](https://github.com/codemariner/schemart/issues/1).

## [1.3.0]

### Features
* Add support for generating TypeScript types. This can be used in combination with runtime type validation libraries like [typia](https://github.com/samchon/typia).

## [1.2.1]

### Fixes
* Fixed incorrect type definition (after updating to TypeScript 4.9.5).

### Chores
* Updated dependencies.

## [1.2.0]

### Features
* Add configuration option `camelCase`. Set to false to generate types with names that match the database. Defaults to true.
* Add configuration option `tables`. This allows the specification of particular tables (or views) to generate types for.

## [1.1.0]

### Features
* Add support for SQL Server. `mssql` is now an option for 'dataType'.
* Now including an `srt.Date` runtime type in generated files.
### Chores
* Update README
* Add initial test configurations and update examples.

## [1.0.0]
### Chores
* Code reorganization
* README update
### Features
- Make database driver packages optional dependencies. You now need to
  install mysql2 or pg packages.

## [0.1.9]
### Features
- Add support for generating extra information in comments.
  ```yaml
  extraInfo:
    indexes: true
	dataType: true
  ```

## [0.1.8]
### Chores
- Finish and fix comment/description generation.
### Features
- Implement dry run mode. Results will be printed to stdout rather than written to a file.

## [0.1.7]
### Chores
- Added examples (see examples directory).
### Features
- Completed initial MySQL support.

## [0.1.6]
### Bug Fixes
- Fix excludeTables handling.

## [0.1.4]
### Bug Fixes
- No longer generating TypeScript type code for non-enum enums (letting it come from the runtype). This only matters when using `enumsAsTypes` option and is otherwise a transparent change.
- Fixed problem with camelizing of names (e.g. blog_posts => BlogPosts instead of Blogposts)
### Features
- Adding initial Mysql (5) support. Not ready for use.
