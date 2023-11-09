const CompressionWebpackPlugin = require("compression-webpack-plugin");
const productionGzipExtensions = ["js", "css"];

module.exports = {
  configureWebpack: {
    plugins: [
      new CompressionWebpackPlugin({
        filename: "[file].gz[query]",
        algorithm: "gzip",
        test: new RegExp("\\.(" + productionGzipExtensions.join("|") + ")$"),
        threshold: 10240,
        minRatio: 0.8
      })
    ]
  },
  pwa: {
    name: "Velocity Portal",
    iconPaths: {
      favicon32: "./public/favicon.ico",
      favicon16: "./public/favicon.ico",
      appleTouchIcon: "./public/favicon.ico",
      maskIcon: "./public/favicon.ico",
      msTileImage: "./public/favicon.ico"
    }
  },
  runtimeCompiler: true
};
