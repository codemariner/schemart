CREATE TYPE gender AS ENUM ('male', 'female');

CREATE TYPE status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE unused AS ENUM ('sample', 'unused', 'enum');

COMMENT ON TYPE status IS 'draft: post is in draft mode
published: post has been published
archived: post was archived';

CREATE TABLE public.users (
	id serial NOT NULL,
	name text NOT NULL,
	email text NOT NULL,
	email_validated boolean DEFAULT FALSE,
	availability tsrange NULL,
    schedule tsrange[] NULL,
	birth_day date NULL,
	gender gender NULL,
	metadata json NULL,
	create_at timestamptz(2) NOT NULL DEFAULT CURRENT_TIMESTAMP(2),
	updated_at timestamptz(2) NOT NULL DEFAULT CURRENT_TIMESTAMP(2),
	CONSTRAINT "PK__users__K1" PRIMARY KEY (id),
	CONSTRAINT "UK__users__K2_k3" UNIQUE (name, email)
);
COMMENT ON TABLE "users" IS 'A customer user account.';
COMMENT ON COLUMN "users"."availability" IS 'The range of time the user is considered available.';

CREATE TABLE public.blog_posts (
	id serial NOT NULL,
	user_id int4 NOT NULL,
	subject varchar(250) NOT NULL,
	content text NULL,
	create_at timestamptz(2) NOT NULL DEFAULT CURRENT_TIMESTAMP(2),
	updated_at timestamptz(2) NOT NULL DEFAULT CURRENT_TIMESTAMP(2),
	CONSTRAINT "PK__blog_posts__K1" PRIMARY KEY (id),
	CONSTRAINT "FK__blog_posts__K2__users__K1" FOREIGN KEY (user_id) REFERENCES users(id),
	CONSTRAINT "UK__blog_posts__K3" UNIQUE (subject)
);

INSERT INTO public.users(
	name,
	email
) VALUES (
    'Joe Foo',
    'joe.foo@mail.com'
);

INSERT INTO public.users(
	name,
	email,
    email_validated,
	availability,
    schedule,
	birth_day,
	gender,
    metadata
) VALUES (
    'Jane Smith',
    'jane.smith@mail.com',
    true,
    '[2021-10-31 00:00:00, 2021-11-10 00:00:00)'::tsrange,
    ARRAY ['[2021-10-31 00:00:00, 2021-11-10 00:00:00)'::tsrange,'[2021-11-10:00:00, 2021-11-20 00:00:00)'::tsrange],
    '1973-12-12',
    'male',
    '{"foo":"bar"}'
);

INSERT INTO public.blog_posts (
	user_id,
	subject,
	content
) VALUES (
	1,
	'test post',
	'some content'
);

