<template>
    <SimpleTable :searchVisible="true" :columns="getEntityFields('Prescription', 'listable')"
        :searches="getEntityFields('Prescription', 'searchable')" :searchMethod="onSearch" :actions="actions">
    </SimpleTable>
</template>
<script>
import SimpleTable from '@/components/SimpleTable.vue';
import { visitApi } from '@gcp/visit/visit_api';

import { rootPath } from '@gcp/router';
export default {
    props: {
        projectId: {},
    },
    watch: {
        /*
        'visitId': {
            async handler(newVal) {
                this.initVisitId(newVal);
            },
        },
        */
    },
    components: { SimpleTable },
    data() {
        return {
            actions: [
                {
                    desc: "详情",
                    method: 'onPrescriptionDetail',
                },
            ]
        }
    },
    methods: {
        async onSearch(params) {
            return await visitApi.searchProjectPrescriptions(this.projectId, params);
        }
    }
}
</script>
<style lang="scss" scoped>
.el-tabs ::v-deep {
    .el-tabs__item {
        height: 70px;
        line-height: 70px;
        padding-left: 5px;
        padding-right: 10px;
    }
}
</style>