const webpack = require("webpack");
const path = require("path");

module.exports = {
  plugins: [
    // fix "process is not defined" error:
    // (do "npm install process" before running the build)
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
  ],
  entry: {
    background: "./background.js",
    content: "./content.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
};
