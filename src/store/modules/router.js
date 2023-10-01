import { getRoutes } from "@/app/router";

const state = {
    routers: getRoutes()
};

export default {
    namespaced: true,
    state
}