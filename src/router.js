import Vue from 'vue'
import Router from 'vue-router'
/* Layout */

import Layout from '@/layout'

// import { title } from '@/settings'
import { getRoutes } from '@app/router'


Vue.use(Router)

var topRoute = {
    path: '/',
    component: Layout,
    hidden: true,
    children: [],
};

// 公共路由
export const constantRoutes = [
    {
        path: '/hello2',
        component: (resolve) => require(['@/components/HelloWorld'], resolve),
    },
    {
        path: '/hello',
        component: Layout,
        redirect: 'home',
        children: [{
            path: 'home',
            component: (resolve) => require(['@/components/HelloWorld'], resolve),
            name: 'Home',
            meta: { title: 'Home', icon: 'dashboard', affix: true }
        }
        ]
    },
    topRoute
];

getRoutes().forEach(r => {
    r.meta = { title: r.name };
    topRoute.children.push(r);
});

export default new Router({
    base: process.env.VUE_APP_APP_NAME ? process.env.VUE_APP_APP_NAME : "/",
    mode: 'history', // 去掉url中的#
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
})
