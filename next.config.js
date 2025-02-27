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
            },
            {
                protocol: 'https',
                hostname: 'strapi-palladio-production.up.railway.app'
            },
            {
                protocol: 'https',
                hostname: 'bucket-production-3bbd.up.railway.app'
            },
            {
                protocol: 'https',
                hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com'
            },
           {
                protocol: 'http',
                hostname: 'localhost:9000',
            },
             {
                protocol: 'https',
                hostname: 'localhost:9000',
            },
            {
                protocol: 'https',
                hostname: 'strapi-palladio-production.up.railway.app',
            },
             {
                protocol: 'http',
                hostname: 'strapi-palladio-production.up.railway.app',
            },
            {
                protocol: 'http',
                hostname: 'localhost:9000',
            }
        ]
    },
    reactStrictMode: true,
};

module.exports = nextConfig;
