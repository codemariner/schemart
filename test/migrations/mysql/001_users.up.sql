CREATE TABLE users (
	id serial NOT NULL,
	name varchar(30) NOT NULL,
	email varchar(50) NOT NULL,
	email_validated tinyint DEFAULT FALSE,
	birth_day date NULL,
	gender ENUM('male','female') NULL,
	metadata json NULL,
	create_at timestamp(2) NOT NULL,
	updated_at timestamp(2) NOT NULL,
	PRIMARY KEY (id),
	UNIQUE (name, email)
);
