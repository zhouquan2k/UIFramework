import { initRouter } from '@/router'
import menuApi from '@user/menu_api'
import Layout from '@/layout/index'
// import ParentView from '@/components/ParentView';

const menus = {
  state: {
    menus: [],
    routes: [],
  },
  mutations: {
    SET_MENUS: (state, menus) => {
      state.menus = menus;
    },
    SET_ROUTES: (state, routes) => {
      // state.addRoutes = routes
      state.routes = routes;
    }
  },
  actions: {
    ProcessMenus({ commit }) {
      // load menu from api
      return menuApi.list().then(res => {
        const menus = res;

        const processMenu = function (menu, parent) {
          var ret = {};
          if (menu.menuName) {
            var basePath = parent ? parent.fullPath : '/';
            var isTopNode = parent.fullPath == '/';
            ret = {
              ...{
                name: menu.menuName,
                path: menu.children && menu.children.length > 0 ? `${isTopNode ? '/' : ''}${menu.path}` : `${menu.function}`,
                meta: { title: menu.menuName },
              }
            };
            if (!menu.parentId) {
              ret.component = Layout;
            }
            else if (menu.feComponent) {
              ret.component = loadView(menu.feComponent);
            }
            menu.fullPath = ret.path + "/";
          }
          if (menu.children) {
            ret.children = menu.children.map(m => processMenu(m, menu));
          }
          return ret;
        }
        const convertedMenus = processMenu({ children: menus, fullPath: '/' }, null);
        const sidebarMenu = [constantRouteToMenus(), ...convertedMenus.children];
        const routes = menusToRoutes(convertedMenus.children);
        commit('SET_MENUS', sidebarMenu);
        commit('SET_ROUTES', routes);

        return routes;
      });
    }
  }
}

// menu is route now
function menusToRoutes(menus) {
  return menus;
}

function constantRouteToMenus() {
  return initRouter()[0];
}

export const loadView = (view) => { // 路由懒加载
  // return (resolve) => require([`@/views/${view}`], resolve)
  const modules = ['user', 'app', 'gcp']
  for (var m of modules) {
    if (view && view.startsWith('@' + m + '/')) {
      const path = view.substring(m.length + 2);
      if (m == 'user') //hard code modules here
        return (resolve) => require([`@user/${path}`], resolve)
      if (m == 'gcp')
        return (resolve) => require([`@gcp/${path}`], resolve)
    }
  }
  // TODO throw exception?
  return null;
};

export default menus;
