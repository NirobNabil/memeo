/** @type {import('next').NextConfig} */
const intercept = require("intercept-stdout")

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["links.papareact.com", 
    "platform-lookaside.fbsbx.com", 
    "firebasestorage.googleapis.com",
    "img.freepik.com", 
    "images.unsplash.com",
    "www.gettyimages.ca",
  ],
  },
}

// safely ignore recoil warning messages in dev (triggered by HMR)
function interceptStdout(text) {
  if (text.includes("Duplicate atom key")) {
    return ""
  }
  return text
}

if (process.env.NODE_ENV === "development") {
  intercept(interceptStdout)
}

module.exports = nextConfig


