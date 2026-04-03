import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig, type LibraryFormats } from 'vite'
import dts from 'vite-plugin-dts'
import svgLoader from 'vite-svg-loader'
import generateIcons from "./scripts/pluginGenerateIcons.ts";


export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'VueVkontakteIcons',
        fileName: 'index',
        formats: ['es'] as LibraryFormats[],
      },
      emptyOutDir: true,
      rollupOptions: {
        external: ['vue'],
        output: {
          exports: 'named' as 'named',
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
    plugins: [
      vue(),
      svgLoader({
        svgo: false,
      }),
      generateIcons(),
      dts({
        tsconfigPath: './tsconfig.app.json',
        entryRoot: 'src',
        include: [
          'src/**/*',
          'src/**/*.d.ts',
        ],
        insertTypesEntry: true,
        staticImport: true,
        rollupTypes: true,
        strictOutput: true,
        copyDtsFiles: true,

      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  }
})
