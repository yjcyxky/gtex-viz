import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';

const name = 'TranscriptBrowser';
export default {
    input: 'src/' + name + '.js',
    output: {
        file: 'build/js/transcript-browser.bundle.min.js',
        format: 'iife',
        sourcemap: 'inline',
        name: name,
    },
    plugins: [
        nodeResolve({ jsnext: true, main: true }),
        commonjs()
    ]
}
