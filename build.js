const vuePlugin = require('esbuild-vue');
require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: false,
  sourcemap: true,
  outfile: 'dist/index.js',
  write: true,
  plugins: [
    vuePlugin()
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify("development"),
  }
});