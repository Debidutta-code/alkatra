/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // 👈 Important line for static export
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                hostname: "alhajz.s3.me-south-1.amazonaws.com"
            },
            {
                hostname: "res.cloudinary.com"
            },
        ]
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/app',
                permanent: true,
            },
        ]
    },
        experimental: {
          serverActions: {
            bodySizeLimit: '2mb',
          },
        },
}

module.exports = nextConfig
