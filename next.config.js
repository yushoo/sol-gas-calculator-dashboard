/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const nextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    // Add the systemvars option to dotenv-webpack
    config.plugins.push(new webpack.EnvironmentPlugin({ systemvars: true }));
    return config;
  },
};

module.exports = nextConfig;
