import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import BattleArenaView from '../views/BattleArenaView.vue'
import ResultView from '../views/ResultView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: LandingView
        },
        {
            path: '/battle',
            name: 'battle',
            component: BattleArenaView
        },
        {
            path: '/result',
            name: 'result',
            component: ResultView
        }
    ]
})

export default router
