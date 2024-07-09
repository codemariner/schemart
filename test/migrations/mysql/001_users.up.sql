CREATE TABLE users (
	id serial NOT NULL,
	name varchar(30) NOT NULL,
	email varchar(50) NOT NULL,
	email_validated tinyint DEFAULT 0,
	birth_day date NULL,
	gender ENUM('male','female') NULL COMMENT "user gender",
	metadata json NULL,
	create_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	UNIQUE (name, email)
);

INSERT INTO users(
	name,
	email
) VALUES (
    'Joe Foo',
    'joe.foo@mail.com'
);

INSERT INTO users(
	name,
	email,
    email_validated,
	birth_day,
	gender,
    metadata
) VALUES (
    'Jane Smith',
    'jane.smith@mail.com',
    true,
    '1973-12-12',
    'male',
    '{"foo":"bar"}'
);



CREATE TABLE blog_posts (
	id serial NOT NULL,
	user_id bigint(20) unsigned NOT NULL,
	subject varchar(250) NOT NULL,
	content text NULL,
	create_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES users(id),
	UNIQUE (subject)
) COMMENT 'user blog posts';

INSERT INTO blog_posts (
	user_id,
	subject,
	content
) VALUES (
	1,
	'test post',
	'some content'
);