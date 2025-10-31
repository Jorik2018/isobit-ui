import typescript from '@rollup/plugin-typescript';
import vue from 'rollup-plugin-vue';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import css from 'rollup-plugin-css-only';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'esm',
        file: 'dist/library.mjs'
      },
      {
        format: 'cjs',
        file: 'dist/library.js'
      }
    ],
    external:['pinia'],
    plugins: [
      vue(),
      peerDepsExternal(),
      typescript(),terser(),
      css({ output: 'theme.css' }),
      
    ]
  }
];
