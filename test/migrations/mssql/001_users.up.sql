CREATE TABLE users (
	id int NOT NULL IDENTITY,
	name nvarchar(50) NOT NULL,
	email nvarchar(50) NOT NULL,
	email_validated bit DEFAULT 0,
	birth_day date NULL,
	gender char(1) NULL,
	metadata  ntext NULL,
	created_at datetime2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at datetime2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "PK__users__K1" PRIMARY KEY (id),
	CONSTRAINT "UK__users__K2_k3" UNIQUE (name, email),
	CONSTRAINT check_gender CHECK (gender IN('M', 'F') )
);


CREATE TABLE blog_posts (
	id int NOT NULL IDENTITY,
	user_id int NOT NULL,
	subject nvarchar(250) NOT NULL,
	content nvarchar(4000) NULL,
	created_at datetime2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at datetime2 NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "PK__blog_posts__K1" PRIMARY KEY (id),
	CONSTRAINT "FK__blog_posts__K2__users__K1" FOREIGN KEY (user_id) REFERENCES users(id),
	CONSTRAINT "UK__blog_posts__K3" UNIQUE (subject)
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
    1,
    '1973-12-12',
    'M',
    '{"foo":"bar"}'
);

INSERT INTO blog_posts (
	user_id,
	subject,
	content
) VALUES (
	1,
	'test post',
	'some content'
);

