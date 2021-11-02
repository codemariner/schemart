CREATE TYPE gender AS ENUM ('male', 'female');

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