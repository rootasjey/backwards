# http://brunch.io/docs/config
module.exports =
  conventions:
    assets: 'app/static/**'
  files:
    javascripts:
      joinTo:
        'app.js': 'app/**'
        'vendor.js': ['node_modules/**']
    stylesheets:
      joinTo: 'app.css'
  modules:
    autoRequire:
      'app.js': ['initialize']
  npm:
    static: [
      'node_modules/phaser/dist/phaser.js'
      # 'node_modules/phaser/dist/phaser-arcade-physics.js'
    ]
  plugins:
    # https://github.com/babel/babel-brunch#configuration
    babel:
      ignore: ['node_modules/**']
      # plugins: ['@babel/plugin-syntax-object-rest-spread']
  server:
    noPushState: on
  watcher: {
    awaitWriteFinish: true,
    usePolling: true
  }