/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/research", destination: "/", permanent: true },
      { source: "/presentation", destination: "/#slides", permanent: true },
    ];
  },
};
export default nextConfig;
