import html from '@web/rollup-plugin-html';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { copy } from '@web/rollup-plugin-copy';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import { terser } from 'rollup-plugin-terser';
import summary from 'rollup-plugin-summary';

export default {
  output: { dir: 'dist', entryFileNames: '[name]-[hash].js' },
  input: '*.html',
  plugins: [
    html({ minify: true }),
    minifyHTML(),
    babel({ babelHelpers: 'bundled', extensions: ['.ts'] }),
    nodeResolve({ extensions: ['.ts', 'mjs', 'js'] }),
    copy({ patterns: 'images/*.{svg,png}', exclude: '', rootDir: undefined }),
    terser({ ecma: 2020, module: true }),
    summary({}),
  ],
};