import { request } from '@/utils/utils'

export default class CrudApi {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getMetadata() {
        return await request({
            url: `${this.baseUrl}/metadata`,
            method: 'get',
        });
    }

    async get(id, options) {
        return await request({
            url: `${this.baseUrl}/${id}`,
            method: 'get',
            ...options
        });
    }

    async search(object, options) {
        return await request({
            url: `${this.baseUrl}/search`,
            method: 'post',
            data: object,
            ...options
        });
    }

    async list(options) {
        return await request({
            url: `${this.baseUrl}`,
            method: 'get',
            ...options
        });
    }

    async create(object, options) {
        return await request({
            url: `${this.baseUrl}`,
            method: 'post',
            data: object
        });
    }
    async update(id, object, options) {
        return await request({
            url: `${this.baseUrl}/${id}`,
            method: 'put',
            data: object
        });
    }
    async delete(id, options) {
        return await request({
            url: `${this.baseUrl}/${id}`,
            method: 'delete',
            ...options
        });
    }
}
