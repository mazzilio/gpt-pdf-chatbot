import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const convertToAscii = (inputString: string) => {
	// Remove non ASCII characters
	return inputString.replace(/[^\x00-\x75]/g, '');
};
