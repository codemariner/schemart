// generated from schemart
import * as rt from 'runtypes';

function isDate(value: unknown): value is Date {
	return value instanceof Date;
}

const DateRt = rt.Unknown.withGuard(isDate);

export enum Gender {
	male,
	female,
}
function isGender(value: unknown): value is Gender {
	return Object.values(Gender).includes(value as Gender);
}
export const GenderEnum = rt.Unknown.withGuard(isGender);

export const BlogPosts = rt.Record({
	id: rt.Number,
	userId: rt.Number,
	subject: rt.String,
	content: rt.Optional(rt.String.Or(rt.Null)),
	createAt: DateRt,
	updatedAt: DateRt,
});
export type BlogPosts = rt.Static<typeof BlogPosts>;

export const Users = rt.Record({
	id: rt.Number,
	name: rt.String,
	email: rt.String,
	emailValidated: rt.Optional(rt.Number.Or(rt.Null)),
	birthDay: rt.Optional(DateRt.Or(rt.Null)),
	metadata: rt.Optional(rt.Unknown.Or(rt.Null)),
	createAt: DateRt,
	updatedAt: DateRt,
});
export type Users = rt.Static<typeof Users>;
