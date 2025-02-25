/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Only include valid remote patterns. Temporary removal of extra entries.
        remotePatterns: [{
                protocol: 'https',
                hostname: 'palladio-store-backend-production.up.railway.app'
            },
            {
                protocol: 'https',
                hostname: 'palladio-store-strapi-production.up.railway.app'
            }
        ]
    },
    reactStrictMode: true,
};

module.exports = nextConfig;