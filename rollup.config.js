import vue from 'rollup-plugin-vue';
import commonjs from 'rollup-plugin-commonjs';

export default {
    entry: 'index.js',
    plugins: [
        commonjs(),
        vue(),
    ]
}