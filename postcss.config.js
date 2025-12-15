// postcss.config.mjs
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssHash from 'postcss-hash';

export default {
  plugins: [
    autoprefixer,
    cssnano,
    postcssHash({
      manifest: './src/_data/hashes_css.json',
    }),
  ],
};
