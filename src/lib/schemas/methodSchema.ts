import { z } from 'zod';

export const deleteMethodSchema = z.object({
	method: z.literal('DELETE', {
		invalid_type_error: 'Only DELETE method is allowed',
	})
});

export const postMethodSchema = z.object({
	method: z.literal('POST', {
		invalid_type_error: 'Only POST method is allowed',
	})
});

export const getMethodSchema = z.object({
	method: z.literal('GET', {
		invalid_type_error: 'Only GET method is allowed',
	})
});