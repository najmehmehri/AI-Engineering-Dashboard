import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
        strictPort: true // اگر 5174 پر بود خطا بدهد تا متوجه تداخل شوید
    }
})
