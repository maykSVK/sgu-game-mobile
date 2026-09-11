import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import axios from 'axios'

// Nastavenie base URL. Ak bežíme lokálne, použije proxy vo vite, inak VITE_API_URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
