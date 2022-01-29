import { Literal, Static, Union } from 'runtypes';

/** Represents the possible values for the types of databases that are currently handled. */
export const DatabaseType = Union(Literal('postgres'), Literal('mysql'), Literal('mssql'));
export type DatabaseType = Static<typeof DatabaseType>;

export const DatabaseTypeNames = DatabaseType.alternatives.map((literal) => literal.value);
