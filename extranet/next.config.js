/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // 👈 Important line for static export
    reactStrictMode: true,
    trailingSlash: true, // Add this for better static export compatibility
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                hostname: "alhajz.s3.me-south-1.amazonaws.com"
            },
            {
                hostname: "res.cloudinary.com"
            },
        ]
    },
    // Remove the redirects section - doesn't work with static exports
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
}

module.exports = nextConfig