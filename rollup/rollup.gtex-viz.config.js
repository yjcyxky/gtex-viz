import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';

const name= 'GTExViz';
export default {
    input: 'src/' + name + '.js',
    output: {
        file: 'build/js/gtex-viz.bundle.min.js',
        format: 'iife',
        name: name,
        sourcemap: 'inline'
    },
    plugins: [
        nodeResolve({ jsnext: true, main: true }),
        commonjs()
    ]
}
