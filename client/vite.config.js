import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/", // Adjust the base depending on where the client will be served ("/" for root).
  server: {
    proxy: {
      '/api': {
        target: 'https://shopc-5tfn.onrender.com', // Proxy requests to the deployed backend
        secure: false, // Use secure HTTPS for the backend
      },
    },
  },
  plugins: [react()],
});
