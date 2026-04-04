import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  console.log('Vite build: GEMINI_API_KEY found:', !!apiKey);
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY || process.env.OPENAI_API_KEY),
    },
    envPrefix: ['VITE_', 'GEMINI_', 'OPENAI_'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
