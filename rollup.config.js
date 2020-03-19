import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import del from 'rollup-plugin-delete'
import html from 'rollup-plugin-bundle-html'
import copy from 'rollup-plugin-copy'
import postcss from 'rollup-plugin-postcss'

const production = !process.env.ROLLUP_WATCH

const purgecss = require('@fullhuman/postcss-purgecss')({
  content: [
    './src/**/*.html',
    './src/**/*.svelte'
  ],

  whitelistPatterns: [/svelte-/],

  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
})

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    dir: 'dist',
    entryFileNames: '[name]-[hash].js'
  },
  plugins: [
    del({ targets: ['dist/**/*.js', 'dist/**/*.css', 'dist/**/*.map'] }),

    svelte({
      dev: !production,
      emitCss: true
    }),

    postcss({
      extract: production,
      minimize: production,
      sourceMap: production,
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        ...(production ? [purgecss] : [])
      ]
    }),

    resolve({
      browser: true,
      dedupe: ['svelte']
    }),

    commonjs(),

    html({
      template: 'src/template.html',
      dest: "dist",
      filename: 'index.html',
      inject: 'body'
    }),

    production && copy({
      targets: [
        { src: 'public/**/*', dest: 'dist' }
      ]
    }),

    production && terser()
  ],
  watch: {
    clearScreen: false
  }
}
