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

    async get(id) {
        return await request({
            url: `${this.baseUrl}/${id}`,
            method: 'get',
        });
    }

    async search(object) {
        return await request({
            url: `${this.baseUrl}/search`,
            method: 'post',
            data: object
        });
    }

    async list() {
        return await request({
            url: `${this.baseUrl}`,
            method: 'get',
        });
    }

    async create(object) {
        return await request({
            url: `${this.baseUrl}`,
            method: 'post',
            data: object
        });
    }
    async update(id, object) {
        return await request({
            url: `${this.baseUrl}/${id}`,
            method: 'put',
            data: object
        });
    }
    async delete(id) {
        return await request({
            url: `${this.baseUrl}/${id}`,
            method: 'delete'
        });
    }
}
