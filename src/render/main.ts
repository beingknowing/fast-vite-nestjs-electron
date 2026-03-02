import { createApp } from 'vue'
import App from './App.vue'

import router from './router'
import pinia from './stores'
const app = createApp(App)
// app.use(ElementPlus)

app.use(router)
app.use(pinia)

app.mount('#app')

console.log('👋 This message is being logged by "renderer.ts", included via Vite');
