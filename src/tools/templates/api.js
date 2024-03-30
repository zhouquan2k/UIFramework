import { request } from '@/utils/utils'

export default class VisitApi {
    constructor(visitId) {
        this.baseUrl = `/api/gcp/visits/${visitId}/prescriptions`;
        this.visitId = visitId;
    }

    async list() {
        if (!this.projectId) return Promise.resolve([]);
        return await request({
            url: `${this.baseUrl}`,
            method: 'get'
        });
    }

    async getPrescription(prescriptionId) {
        return await request({
            url: `/api/gcp/prescriptions/${prescriptionId}`,
            method: 'get'
        });
    }

    async searchProjectPrescriptions(projectId, params) {
        return await request({
            url: `/api/gcp/prescriptions/${projectId}/search`,
            method: 'post',
            data: params
        });
    }
};

export const visitApi = new VisitApi();