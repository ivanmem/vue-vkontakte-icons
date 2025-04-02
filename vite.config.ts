import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import svgLoader from 'vite-svg-loader'
import generateIcons from "./scripts/pluginGenerateIcons.ts";


export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['es'],
        fileName: (format, entryName) => `${entryName}.${format}.js`,
      },
      emptyOutDir: true,
      rollupOptions: {
        external: ['vue'],
        output: {
          exports: 'named',
          globals: {
            vue: 'Vue',
          },
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          preserveModules: true,
          preserveModulesRoot: 'src',
          inlineDynamicImports: false,
        },
      },
    },
    plugins: [
      generateIcons(),
      svgLoader({
        svgo: false,
      }),
      vue(),
      dts({
        tsconfigPath: './tsconfig.app.json',
        entryRoot: 'src',
        include: [
          'src/**/*',
          'src/**/*.d.ts',
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  }
})
