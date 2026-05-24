/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['razorpay', 'pdf-lib', 'nodemailer'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
