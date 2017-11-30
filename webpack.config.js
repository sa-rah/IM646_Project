const path = require('path');
const pkg = require('./package.json');

const SRC_DIR = path.resolve(__dirname, 'src');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

module.exports = {
  context: SRC_DIR,
  entry: `.${path.sep}main.jsx`,
  output: {
    path: PUBLIC_DIR,
    filename: 'bundle.js',
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          SRC_DIR,
        ],
        loader: 'babel-loader',
        options: pkg.babel,
      },
      {
        test: /\.jsx?$/,
        include: [
          SRC_DIR,
        ],
        loader: 'eslint-loader',
      },
      {
        test: /\.css$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
        ],
      },
    ],
  },
};
