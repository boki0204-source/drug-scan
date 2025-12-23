
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Netlify 환경 변수를 브라우저의 process.env.API_KEY로 연결
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
});
