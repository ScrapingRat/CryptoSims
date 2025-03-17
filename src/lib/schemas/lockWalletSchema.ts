import { z } from 'zod';

const lockWalletSchema = z.object({
	method: z.literal('DELETE', {
		invalid_type_error: 'Only DELETE method is allowed',
		required_error: 'Request method is required'
	}),
	cookies: z
		.object({
			token: z
				.string({
					required_error: 'Authentication token is required',
					invalid_type_error: 'Authentication token must be a string'
				})
				.min(1, 'Authentication token cannot be empty')
		})
		.strict()
});

export default lockWalletSchema;
