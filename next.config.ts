import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	serverExternalPackages: ['@node-rs/argon2', 'argon2']
};

export default nextConfig;
