const path = require('path')

module.exports = {
  target: 'node',
  entry: './plugin/app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.js',
    library: {
      type: 'commonjs2'
    }
  },
  externals: {
    'ws': 'commonjs ws'
  },
  resolve: {
    extensions: ['.js']
  },
  mode: 'production',
  experiments: {
    outputModule: false
  }
}
