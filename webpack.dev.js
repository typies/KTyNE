const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "development",
    devServer: {
        watchFiles: ["./src/template.html"],
    },
    devtool: "eval-source-map",
});
