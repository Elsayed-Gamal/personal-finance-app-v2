/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow phones and tablets on the local network to load the development
  // client and HMR connection. Without this, the HTML renders but React does
  // not hydrate, leaving login controls and password toggles unresponsive.
  allowedDevOrigins: ['192.168.1.44'],
};

export default nextConfig;
