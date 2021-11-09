import camelcase from 'lodash.camelcase';

export function capitalize(text: string): string {
	return `${text[0].toUpperCase()}${text.substr(1)}`;
}

export function camelize(text: string): string {
	return capitalize(camelcase(text));
}
