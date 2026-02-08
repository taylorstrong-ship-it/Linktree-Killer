/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'qxkicdhsrlpehgcsapsh.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/apps/post-generator',
                destination: '/apps/post-generator/index.html',
            },
        ];
    },
    // 🛡️ CRITICAL: Exclude node modules from client bundle (fixes Vapi hang)
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
        return config;
    },
};

export default nextConfig;
