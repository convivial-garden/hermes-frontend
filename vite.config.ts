import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import federation from '@originjs/vite-plugin-federation';
const ASSET_URL = process.env.ASSET_URL || '';

// https://vitejs.dev/config/
export default defineConfig({
  base: `${ASSET_URL}/`,
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(),
    federation({
      name: 'disposerv',
      filename: 'disposerv.js',
      exposes: {
        './component': './src/collectivoComponent.jsx',
      },
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
    ],
  },
  build: {
    target: 'esnext',
    minify: false,
  },
});
