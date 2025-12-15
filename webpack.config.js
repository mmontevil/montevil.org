import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Return all files in a directory (non-recursive) as entry points
const getEntryPoints = (directory) =>
  fs.readdirSync(path.join(__dirname, directory))
    .filter((file) => !fs.statSync(path.join(__dirname, directory, file)).isDirectory())
    .reduce((entries, file) => ({
      ...entries,
      [file.split('.')[0]]: `./${directory}/${file}`,
    }), {});

export default {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: () => getEntryPoints('assets/js'),
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: '[name].legacy.js',
    sourceMapFilename: '[file].map',
    path: path.resolve(__dirname, '_site/js'),
  },
};
