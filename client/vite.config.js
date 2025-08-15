import { defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  // Load env file based on `mode` in the current working directory.
  // const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    // server: {
    //   proxy: {
    //     '/api': {
    //       target: env.VITE_API_URL,
    //       changeOrigin: true,
    //       secure: false,
    //     },
    //   },
    // },
    css: {
      postcss: './postcss.config.js',
    },
  }
})
