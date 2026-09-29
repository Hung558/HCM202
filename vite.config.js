import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const pages = ['index', 'chuong1', 'chuong2', 'chuong3', 'chuong4', 'chuong5', 'chuong6']

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      input: Object.fromEntries(pages.map((p) => [p, `${p}.html`])),
    },
  },
})
