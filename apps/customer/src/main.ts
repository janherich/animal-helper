import { createApp } from 'vue'
import App from './app/app.vue'
import { restorePersistedWalk } from './app/walk/adapter'
import './assets/css/tailwind.css'
import { attachLibs } from './libs'
import { attachPlugins } from './plugins'
import { attachProviders } from './providers'

await restorePersistedWalk()
const app = createApp(App)
attachLibs(app)
attachProviders(app)
attachPlugins()
app.mount('#app')
