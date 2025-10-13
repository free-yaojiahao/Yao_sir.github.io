import { createRouter, createWebHashHistory } from 'vue-router'

import Home from './pages/Home.vue'
import Detail from './pages/Detail.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/detail/:id', name: 'detail', component: Detail, props: true },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

export default router


