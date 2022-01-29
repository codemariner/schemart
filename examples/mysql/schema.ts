// generated from schemart
import * as rt from 'runtypes';

// custom schemart types
const srt = {
	Date: rt.Unknown.withGuard((x: unknown): x is Date => x instanceof Date),
};

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
	createAt: srt.Date,
	updatedAt: srt.Date,
});
export type BlogPosts = rt.Static<typeof BlogPosts>;

export const Users = rt.Record({
	id: rt.Number,
	name: rt.String,
	email: rt.String,
	emailValidated: rt.Optional(rt.Number.Or(rt.Null)),
	birthDay: rt.Optional(srt.Date.Or(rt.Null)),
	metadata: rt.Optional(rt.Unknown.Or(rt.Null)),
	createAt: srt.Date,
	updatedAt: srt.Date,
});
export type Users = rt.Static<typeof Users>;
