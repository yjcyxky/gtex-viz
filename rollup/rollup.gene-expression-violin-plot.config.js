import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';

/* to set the NODE_ENV
in a terminal window (bash)
export NODE_ENV="development"
echo $NODE_ENV
 */
const name = 'GeneExpressionViolinPlot';
export default {
    input: 'src/' + name + '.js',
    output: {
        file: 'build/js/gene-expression-violin-plot.bundle.min.js',
        format: 'iife',
        name: name,
        sourcemap: 'inline'
    },
    plugins: [
        commonjs(),
        nodeResolve({ jsnext: true, main: true })
    ]
}
