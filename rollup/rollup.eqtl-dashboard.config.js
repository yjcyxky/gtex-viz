import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';

const name = 'EqtlDashboard';
export default {
    input:'src/' + name + '.js',
    output: {
        file: 'build/js/eqtl-dashboard.bundle.min.js',
        format: 'iife',
        sourcemap: 'inline',
        name: name,
    },
    plugins: [
        nodeResolve({ jsnext: true, main: true }),
        commonjs()
    ]
}
