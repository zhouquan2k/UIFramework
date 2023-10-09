/* Layout */
import Layout from '@/layout'

// import { title } from '@/settings'
import { getRoutes as getUserRoutes } from '@user/router'
import { getRoutes as getAppRoutes } from '@app/router'


export function initRouter() {
    var topRoute = {
        path: '/',
        component: Layout,
        hidden: true,
        children: [],
    };

    // 公共路由
    const constantRoutes = [
        topRoute,
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
    ];

    [...getAppRoutes(), ...getUserRoutes()].forEach(r => {
        r.meta = { title: r.name };
        topRoute.children.push(r);
    });

    return constantRoutes;
}


