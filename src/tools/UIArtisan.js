/**
 * UIArtisanApi
 * uiArtisanApi
 * @authors Quan Zhou (zhouquan2k@gmail.com)
 */
import { request } from '@/utils/utils';

export default class UIArtisanApi {
    constructor(uiPath) {
        this.baseUrl = '/api/ui-artisan';
        this.baseUiUrl = `${this.baseUrl}/${uiPath ? uiPath.replace(/\//g, '|') : ''}`;
    }

    async getTree() {
        return await request({
            url: `${this.baseUiUrl}/tree`,
            method: 'get',
        });
    }

    async getComponents() {
        return await request({
            url: `${this.baseUrl}/components`,
            method: 'get',
            params: { path: this.uiPath }
        });
    }

    // batch create api
    async createComponent(id, newComponents) {
        return await request({
            url: `${this.baseUiUrl}/${id}`,
            method: 'post',
            data: newComponents
        });
    }

    async moveComponent(id, droppedId, droppedType) {
        return await request({
            url: `${this.baseUiUrl}/${id}/move`,
            method: 'put',
            data: { droppedId, droppedType }
        });
    }

    async updateComponent(selectedNode, editingProperty) {
        return await request({
            url: `${this.baseUiUrl}/${selectedNode.id}`,
            method: 'put',
            data: { [editingProperty]: selectedNode.properties[editingProperty] }
        });
    }

    async deleteComponent(id) {
        return await request({
            url: `${this.baseUiUrl}/${id}`,
            method: 'delete'
        });
    }
};

export function uiArtisanDesignTime(params) {
    if (this[params] === undefined) return;
    this[params] = !this[params];
}

export const uiArtisanApi = new UIArtisanApi();