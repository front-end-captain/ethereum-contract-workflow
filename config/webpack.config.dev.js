const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const { SRC_PATH, BUILD_PATH, ASSETS_PATH } = require("./constant.js");

const devConfig = {
  devtool: "cheap-module-source-map",

  mode: "development",

  entry: {
    app: ["react-hot-loader/patch", SRC_PATH + "/index.js"],
  },

  output: {
    path: BUILD_PATH,
    filename: "[name]-[hash:8].js",
    publicPath: ASSETS_PATH,
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: require.resolve("babel-loader"),
        include: SRC_PATH,
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: require.resolve("css-hot-loader"),
          },
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: require.resolve("css-loader"),
            options: {
              modules: true,
              sourceMap: true,
              // 确保 css 生效，所有生成的 css 类名保持原有类名
              // 使用其他标识模板或者无此配置项 css 样式将无效!!!
              localIdentName: "[local]",
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new CleanWebpackPlugin([BUILD_PATH]),
    // 开发环境并且在启用 HMR 情况下，单独分割的 css 文件不能带有 hash !!!
    // 否则 HMR 将失效!!!
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new HtmlWebpackPlugin({
      template: SRC_PATH + "/template.html",
      filename: "index.html",
      title: "Ethereum DApp",
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],

  devServer: {
    host: "0.0.0.0",
    port: "8000",
    contentBase: BUILD_PATH,
    hot: true,
    overlay: {
      errors: true,
    },
    publicPath: ASSETS_PATH,
    historyApiFallback: {
      index: ASSETS_PATH + "index.html",
    },
  },
};

module.exports = devConfig;
