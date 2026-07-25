import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function buildTimestamp() {
  const now = new Date();
  const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const mm = String(est.getMonth() + 1).padStart(2, '0');
  const dd = String(est.getDate()).padStart(2, '0');
  const yy = String(est.getFullYear()).slice(-2);
  const hh = String(est.getHours()).padStart(2, '0');
  const min = String(est.getMinutes()).padStart(2, '0');
  return `${mm}/${dd}/${yy} ${hh}:${min} EST`;
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Slots/',
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp()),
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
