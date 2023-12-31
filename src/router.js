/* Layout */
import Layout from '@/layout'
import store from './store'

// import { title } from '@/settings'
import { getRoutes as getUserRoutes } from '@user/router'
// import { getRoutes as getAppRoutes } from '@app/router'
import { getRoutes as getGcpRoutes } from '@gcp/router'

//async
export async function initRouter() {
    var testRoute = {
        name: 'test0',
        path: '/test',
        component: Layout,
        meta: { title: '测试', icon: 'form' },
        children: [],
    };

    // 公共路由
    const constantRoutes = [
        testRoute,
        {
            path: '/',
            component: Layout,
            children: [{
                path: 'profile',
                component: (resolve) => require(['@user/Profile'], resolve),
            }]
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

    //...getAppRoutes(),
    // test routes
    [...getUserRoutes(), ...getGcpRoutes()].forEach(r => {
        if (!r.meta) r.meta = { title: r.name };
        testRoute.children.push(r);
    });
    window.testRoutes = testRoute;

    //获取可访问菜单

    let dynamicRoutes = [];
    try {
        dynamicRoutes = await store.dispatch('ProcessMenus');
    }
    catch (e) {

    }
    // this.$router.addRoutes(routes) // 动态添加可访问路由表

    return [...constantRoutes, ...dynamicRoutes];
}


