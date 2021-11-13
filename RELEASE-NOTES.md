## 0.1.9
- Add support for generating extra information in comments.
  ```yaml
  extraInfo:
    indexes: true
	dataType: true
  ```
## 0.1.8
- Finish and fix comment/description generation.
- Implement dry run mode. Results will be printed to stdout rather than written to a file.
## 0.1.7
- Completed initial MySQL support.
- Added examples (see examples directory).
## 0.1.6
- Fix excludeTables handling.
## 0.1.4
- Adding initial Mysql (5) support. Not ready for use.
- No longer generating TypeScript type code for non-enum enums (letting it come from the runtype). This only matters when using `enumsAsTypes` option and is otherwise a transparent change.
- Fixed problem with camelizing of names (e.g. blog_posts => BlogPosts instead of Blogposts)
-
