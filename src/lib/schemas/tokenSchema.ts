import { z } from 'zod';

const tokenSchema = z.object({
	token: z
		.string({
			required_error: 'Authentication token is required',
			invalid_type_error: 'Invalid token format'
		})
		.min(1, 'Token cannot be empty')
});

export default tokenSchema;
