CREATE TYPE gender AS ENUM ('male', 'female');

CREATE TABLE public.users (
	id serial NOT NULL,
	name text NOT NULL,
	email text NOT NULL,
	email_validated boolean DEFAULT FALSE,
	availability tsrange[] NULL,
	birth_day date NULL,
	gender gender NULL,
	metadata json NULL,
	create_at timestamptz(2) NOT NULL,
	updated_at timestamptz(2) NOT NULL,
	CONSTRAINT "PK__users__K1" PRIMARY KEY (id),
	CONSTRAINT "UK__users__K2_k3" UNIQUE (name, email)
);
