module.exports = {
  // @see https://github.com/vuejs/vue-cli/issues/2948
  chainWebpack: config => config.resolve.symlinks(false),
  // @see https://cli.vuejs.org/ru/config/#publicpath
  publicPath: process.env.NODE_ENV === 'production' ? '/webgl-helix-ribbon/example/dist/' : '/'
}
