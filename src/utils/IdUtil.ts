import { customAlphabet } from 'nanoid';

export class IdUtil {
	public static generateId = (length: number) => {
		const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', length)
		const id = nanoid();
		return id;
	}
	/*public static alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	public static generateId = (length: number) => customAlphabet(IdUtil.alphabet, length);*/
}
