/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    webpack(config, { dev }) {
        if (dev) {
            config.watchOptions = {
                ...config.watchOptions,
                poll: 1000,
                aggregateTimeout: 200,
                ignored: /node_modules/,
            };
        }

        return config;
    },
};

export default nextConfig;
