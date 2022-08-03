import { defineConfig } from 'rollup'
import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import dts from 'rollup-plugin-dts';
import pkg from './package.json';
import { DEFAULT_EXTENSIONS } from '@babel/core'
import { minify } from 'rollup-plugin-esbuild'

const extensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx'];

function defaultPlugins(additionalPlugins = []) {
  return [
    nodeResolve(),
    commonjs(),
    process.env.NODE_ENV === 'production' && minify(),
    ...additionalPlugins
  ]
}

function defaultOutput(filename, additionalPlugins = []) {
  return [
    {
      file: `dist/cjs/${filename}.js`,
      format: 'cjs',
    },
    {
      file: `dist/esm/${filename}.js`,
      format: 'esm',
    }
  ]
}

export default defineConfig([
  {
    input: 'src/index.tsx',
    external: [
      ...Object.keys(pkg.peerDependencies),
      'react/jsx-runtime'
    ],
    output: defaultOutput(
      'index',
    ),
    plugins: defaultPlugins(
      [
        babel({
          presets: [
            "@babel/preset-typescript",
            ["@babel/preset-react", { "runtime": "automatic" }]
          ],
          extensions
        })
      ]
    )
  },
  {
    input: 'src/solid.tsx',
    external: [
      ...Object.keys(pkg.peerDependencies),
      'solid-js/web',
    ],
    output: defaultOutput('solid'),
    plugins: defaultPlugins([
      babel({
        presets: [
          '@babel/preset-typescript',
          'babel-preset-solid'
        ],
        extensions
      })
    ])
  },
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm'
    },
    plugins: [
      dts()
    ]
  },
  {
    input: 'src/solid.tsx',
    output: {
      file: 'dist/solid.d.ts',
      format: 'esm'
    },
    plugins: [
      dts()
    ]
  },
])