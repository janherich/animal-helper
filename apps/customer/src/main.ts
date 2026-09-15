import { createApp } from 'vue'
import App from './app/app.vue'
import './assets/css/tailwind.css'
import { attachLibs } from './libs'
import { attachPlugins } from './plugins'
import { attachProviders } from './providers'

const app = createApp(App)
attachLibs(app)
attachProviders(app)
attachPlugins()
app.mount('#app')
