// vite.config.js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path // Simply pass through the path as is        
      }
    }    
  }   
});

/*
export default defineConfig(({}) => {
  const config = {
    plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    ],
  
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        '/api/v1/': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: path => path // Simply pass through the path as is        
        }      
      }    
    }  
  }
  
  console.log('Vite build target:--> ', config.server.path);

  return config;
});
*/