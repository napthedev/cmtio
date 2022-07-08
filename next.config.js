const withPlugins = require("next-compose-plugins");
const withPreact = require('next-plugin-preact');
const withAnalyzer = require("@next/bundle-analyzer")({
  enabled:
    process.env.ANALYZE === "true" && process.env.NODE_ENV !== "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

module.exports = withPlugins([withAnalyzer, withPreact], nextConfig);
