const vuePlugin = require('esbuild-vue');

require('esbuild').build({
  entryPoints: ['src/browser.ts'],
  bundle: true,
  minify: false,
  sourcemap: true,
  outfile: 'dist/browser.js',
  plugins: [vuePlugin()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  }
});