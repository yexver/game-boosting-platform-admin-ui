//import './assets/main.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import pinia from '@/stores/index'
import App from './App.vue'
import router from './router'
import './permission'
import * as ElIconsVue from '@element-plus/icons-vue'
import 'echarts'
//import { useUserStore } from '@/stores'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElIconsVue)) {
  app.component(key, component)
}

// 挂载应用之前检查用户登录状态
// const userStore = useUserStore()
// if (userStore.token) {
//   userStore.GetInfo().finally(() => {
//     userStore.loadUserMenuAndPermissions().finally(() => {
//       app.mount('#app')
//     })
//   })
// } else {
//   app.mount('#app')
// }

app.mount('#app')

export default app
