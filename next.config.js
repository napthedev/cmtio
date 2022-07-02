const withAnalyzer = require("@next/bundle-analyzer")({
  enabled:
    process.env.ANALYZE === "true" && process.env.NODE_ENV !== "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack: (config, { isServer, dev }) => {
    //  wait until preact is ready for react 18

    // if (!dev && !isServer) {
    //   config.resolve.alias = {
    //     ...config.resolve.alias,
    //     react: "preact/compat",
    //     "react-dom/test-utils": "preact/test-utils",
    //     "react-dom": "preact/compat",
    //   };
    // }

    return config;
  },
};

module.exports = withAnalyzer(nextConfig);
