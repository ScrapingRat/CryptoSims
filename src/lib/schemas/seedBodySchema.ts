import { z } from 'zod';
import { wordlists } from 'bip39';

const seedBodySchema = z.object({
	seedPhrase: z
		.string({
			required_error: 'Seed phrase is required',
			invalid_type_error: 'Seed phrase must be a string'
		})
		.min(1, 'Seed phrase cannot be empty')
		.refine((val) => val.split(' ').length === 12, {
			message: 'Seed phrase must be exactly 12 words'
		})
		.refine(
			(val) =>
				val
					.split(' ')
					.every((word) => wordlists.english.includes(word)),
			{
				message: 'Seed phrase contains invalid words'
			}
		)
});

export default seedBodySchema;
