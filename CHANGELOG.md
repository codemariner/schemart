# Change Log

All notable changes to this project will be documented in this file.

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
