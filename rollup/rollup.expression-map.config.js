import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';

/* to set the NODE_ENV
in a terminal window (bash)
export NODE_ENV="development"
echo $NODE_ENV
 */
const name= 'ExpressionMap';
export default {
    input: 'src/' + name + '.js',
    output: {
        file: 'build/js/expression-map.bundle.min.js',
        format: 'iife',
        sourcemap: 'inline',
        name: name,
    },
    plugins: [
        commonjs(),
        nodeResolve({ jsnext: true, main: true }),
    ]
}
