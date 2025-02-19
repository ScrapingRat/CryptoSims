import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}'
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				accent1: 'var(--accents-1)',
				accent2: 'var(--accents-2)',
				accent3: 'var(--accents-3)',
				accent4: 'var(--accents-4)',
				accent5: 'var(--accents-5)',
				accent6: 'var(--accents-6)',
				accent7: 'var(--accents-7)',
				accent8: 'var(--accents-8)',
				hover: '#1a1a1a'
			}
		}
	},
	plugins: []
} satisfies Config;
