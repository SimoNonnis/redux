import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';


export default {
  entry: './main.js',
  dest: 'bundle.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    babel({
      babelrc: false,
      presets: 'es2015-rollup',
      exclude: 'node_modules/**'
    }),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};
