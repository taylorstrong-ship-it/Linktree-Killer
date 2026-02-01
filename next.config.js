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
};

export default nextConfig;
