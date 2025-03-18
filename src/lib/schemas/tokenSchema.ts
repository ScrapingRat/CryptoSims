import { z } from 'zod';

export const accessTokenSchema = z
	.object({
		token: z
			.string({
				required_error: 'Acess token is required',
				invalid_type_error: 'Access token must be a string'
			})
			.min(1, 'Access token cannot be empty')
	})
	.strict();

export const typeAccessTokenSchema = z.object({
	type: z.literal('access', {
		invalid_type_error: 'Only access token type allowed'
	})
});

export const refreshTokenSchema = z
	.object({
		refresh_token: z
			.string({
				required_error: 'Refresh token is required',
				invalid_type_error: 'Refresh token must be a string'
			})
			.min(1, 'Refresh token cannot be empty')
	})
	.strict();

export const typeRefreshTokenSchema = z.object({
	type: z.literal('refresh', {
		invalid_type_error: 'Only refresh token type allowed'
	})
});
