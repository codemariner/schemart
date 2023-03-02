// generated from schemart
import * as rt from 'runtypes';

// custom schemart types
const srt = {
	Date: rt.Unknown.withGuard((x: unknown): x is Date => x instanceof Date),
};

/**
 * This is my table comment
 */
export const Users = rt.Record({
	/**
	 * type: int
	 */
	id: rt.Number,
	/**
	 * type: nvarchar
	 */
	name: rt.String,
	/**
	 * type: nvarchar
	 */
	email: rt.String,
	/**
	 * type: bit
	 */
	emailValidated: rt.Optional(rt.Number.Or(rt.Null)),
	/**
	 * type: date
	 */
	birthDay: rt.Optional(srt.Date.Or(rt.Null)),
	/**
	 * type: char
	 */
	gender: rt.Optional(rt.String.Or(rt.Null)),
	/**
	 * type: ntext
	 */
	metadata: rt.Optional(rt.String.Or(rt.Null)),
	/**
	 * type: datetime2
	 */
	createdAt: srt.Date,
	/**
	 * type: datetime2
	 */
	updatedAt: srt.Date,
	/**
	 * type: varchar
	 */
	uName: rt.Optional(rt.String.Or(rt.Null)),
});
export type Users = rt.Static<typeof Users>;

export const BlogPosts = rt.Record({
	/**
	 * type: int
	 */
	id: rt.Number,
	/**
	 * type: int
	 */
	userId: rt.Number,
	/**
	 * type: nvarchar
	 */
	subject: rt.String,
	/**
	 * type: nvarchar
	 */
	content: rt.Optional(rt.String.Or(rt.Null)),
	/**
	 * type: datetime2
	 */
	createdAt: srt.Date,
	/**
	 * type: datetime2
	 */
	updatedAt: srt.Date,
});
export type BlogPosts = rt.Static<typeof BlogPosts>;
