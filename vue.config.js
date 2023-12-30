const { defineConfig } = require('@vue/cli-service')
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // turn off lint
  configureWebpack: {
    devtool: 'source-map', //zhouquan
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
    proxy: {
      '/api': {
        target: 'http://localhost:58080', // 后端服务器地址
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        // pathRewrite: { '^/api': '' } // 如果后端接口没有/api需要通过pathRewrite来重写地址
      },
    },
  },
});
