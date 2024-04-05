import babel from 'rollup-plugin-babel';
import { nodeResolve as resolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

import pkg from '../package.json';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

const targetType = process.env.NODE_ENV === 'prod' ? 'min' : 'dev';
const plugins = [
    babel({
        exclude: 'node_modules/**'
    }),
    resolve({ jsnext: true, main: true }),
    replace({
        ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    commonjs(),
    (process.env.NODE_ENV === 'prod' && terser()) // uglify for production: NODE_ENV=prod rollup -c
];

const prodTasks = [
    {
        input: 'src/index.js',
        output: [
            {
                file: pkg.main,
                format: 'cjs'
            },
            {
                name: 'gtexViz',
                file: pkg.module,
                format: 'es'
            }
        ],
        plugins: [
            external(),
            postcss(),
            babel({
                exclude: 'node_modules/**'
            }),
            resolve(),
            commonjs()
        ]
    },
    {
        input: 'src/GTExViz.js',
        output: {
            name: 'GTExViz',
            file: 'build/js/gtex-viz.bundle.min.js',
            format: 'umd',
            sourcemap: 'inline',
            globals: {
                jquery: '$',
                'file-saver': 'saveAs'
            }
        },
        external: ['file-saver'],
        plugins: plugins
    },
    // {
    //     input: 'src/GeneEqtlVisualizer.js',
    //     output: {
    //         name: 'GeneEqtlVisualizer',
    //         file: 'build/js/gev.bundle.min.js',
    //         format: 'umd',
    //         sourcemap: 'inline',
    //         globals: {
    //             jquery: '$',
    //             'file-saver': 'saveAs'
    //         }
    //     },
    //     external: ['file-saver'],
    //     plugins: plugins
    // },
    {
        input: 'src/QtlViolinPlot.js',
        output: {
            name: 'QtlViolinPlot',
            file: 'build/js/qtl-violin.bundle.min.js',
            format: 'umd',
            sourcemap: 'inline',
            globals: {
                jquery: '$',
                'file-saver': 'saveAs'
            }
        },
        external: ['file-saver'],
        plugins: plugins
    }
];

export default (process.env.NODE_ENV === 'prod' ? prodTasks : []).concat([
    {
        input: 'src/TranscriptBrowser.js',
        output: [
            {
                name: 'TranscriptBrowser',
                file: `build/js/transcript-browser.bundle.${targetType}.js`,
                format: 'umd',
                sourcemap: 'inline',
                globals: {
                    jquery: '$',
                    'file-saver': 'saveAs'
                }
            }
        ],
        external: ['file-saver'],
        plugins: plugins
    },
    // {
    //     input: 'src/GeneExpressionBoxplot.js',
    //     output: [
    //         {
    //             name: 'GeneExpressionBoxplot',
    //             file: `build/js/gene-expression-boxplot.bundle.${targetType}.js`,
    //             format: 'umd',
    //             sourcemap: 'inline',
    //             globals: {
    //                 jquery: '$'
    //             }
    //         }
    //     ],
    //     external: ['jquery'],
    //     plugins: plugins
    // },
    {
        input: 'src/GeneExpressionViolinPlot.js',
        output: [
            {
                name: 'GeneExpressionViolinPlot',
                file: `build/js/gene-expression-violin-plot.bundle.${targetType}.js`,
                format: 'umd',
                sourcemap: 'inline',
                globals: {
                    jquery: '$',
                    'file-saver': 'saveAs'
                }
            }
        ],
        external: ['file-saver'],
        plugins: plugins
    },
    {
        input: 'src/EqtlDashboard.js',
        output: {
            name: 'EqtlDashboard',
            file: `build/js/eqtl-dashboard.bundle.${targetType}.js`,
            format: 'umd',
            sourcemap: 'inline',
            globals: {
                jquery: '$',
                'file-saver': 'saveAs'
            }
        },
        sourcemap: 'inline',
        external: ['file-saver'],
        plugins: plugins
    },
    {
        input: 'src/ExpressionMap.js',
        output: {
            name: 'ExpressionMap',
            file: `build/js/expression-map.bundle.${targetType}.js`,
            format: 'umd',
            sourcemap: 'inline',
            globals: {
                jquery: '$',
                'file-saver': 'saveAs'
            }
        },
        external: ['file-saver'],
        plugins: plugins
    }
]);