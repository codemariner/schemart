## 0.1.4
- Adding initial Mysql (5) support. Not ready for use.
- No longer generating TypeScript type code for non-enum enums (letting it come from the runtype). This only matters when using `enumsAsTypes` option and is otherwise a transparent change.
- Fixed problem with camelizing of names (e.g. blog_posts => BlogPosts instead of Blogposts)
-
