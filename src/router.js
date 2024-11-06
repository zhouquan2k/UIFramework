/* Layout */
import Layout from '@/layout'
import store from './store'

// import { title } from '@/settings'
import { getRoutes as getUserRoutes } from '@user/router'
// import { getRoutes as getAppRoutes } from '@app/router'
import { getRoutes as getGcpRoutes } from '@gcp/router'
// import { getRoutes as getKbRoutes } from '@kb/router'
//async
export function initRouter() {
    const appRoute = {
        name: 'app',
        path: '/',
        redirect: '/gcp/home',
        component: Layout,
        children: [
            {
                path: '/profile',
                component: (resolve) => require(['@user/Profile'], resolve),
            },
            /*
            {
                name: '_版本说明',
                path: '/release-notes',
                meta: { title: '版本说明' },
                beforeEnter(to, from, next) {
                    window.location.href = "https://www.progartisan.com/gcp-release-notes";
                }
            },
            */
        ],
    };

    // 公共路由
    const constantRoutes = [
        appRoute,
        {
            path: '/login',
            // component: (resolve) => require(['@user/login'], resolve),
            component: (resolve) => require(['@gcp/view/login'], resolve),
        },
        {
            path: '/ui-artisan',
            component: (resolve) => require(['@/tools/UIArtisan.vue'], resolve),
        },
        {
            path: '/hello2',
            component: (resolve) => require(['@/components/HelloWorld'], resolve),
        },
        {
            path: '/hello',
            component: Layout,
            redirect: '/hello/home',
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

    // get routes from all modules
    [...getGcpRoutes(), ...getUserRoutes()].forEach(r => { //...getKbRoutes()
        // if (!r.meta) r.meta = { title: r.name };
        appRoute.children.push(r);
    });

    // convert to menu
    store.dispatch('ProcessMenus', appRoute);

    return constantRoutes;
}


