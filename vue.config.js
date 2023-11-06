const { defineConfig } = require('@vue/cli-service')
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // turn off lint
  configureWebpack: {
    // devtool: 'source-map', //zhouquan
    // name: name,
    resolve: {
      alias: {
        '@': resolve('src'),
        '@user': resolve('src/user'),
        '@gcp': resolve('src/gcp'),
      },
    }
  },
  devServer: {
    client: {
      overlay: false
    },
  },
});
