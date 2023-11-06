/* Layout */
import Layout from '@/layout'

// import { title } from '@/settings'
import { getRoutes as getUserRoutes } from '@user/router'
// import { getRoutes as getAppRoutes } from '@app/router'
import { getRoutes as getGcpRoutes } from '@gcp/router'


export function initRouter() {
    var testRoute = {
        name: 'test0',
        path: '/test',
        component: Layout,
        meta: { title: '测试', icon: 'form' },
        children: [],
    };

    // var user_vue = 'user/user.vue'
    // 公共路由
    const constantRoutes = [
        testRoute,
        {
            path: '/',
            component: Layout,
        },
        {
            path: '/login',
            component: (resolve) => require(['@user/login'], resolve),
        },
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
        }/*, // for test
        {
            path: '/system',
            component: Layout,
            hidden: true,
            redirect: 'noredirect',
            children: [{
                path: 'user',
                component: (resolve) => require([`@${user_vue}`], resolve),
                name: 'user',
                meta: { title: '用户管理', icon: 'form', activeMenu: '/system/user' }
            }
            ]
        }
        */
    ];

    //...getAppRoutes(),
    [...getUserRoutes(), ...getGcpRoutes()].forEach(r => {
        r.meta = { title: r.name };
        testRoute.children.push(r);
    });

    return constantRoutes;
}


