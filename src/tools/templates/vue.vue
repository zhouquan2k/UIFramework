<template>
     <SimpleTable ref="table" :searchVisible="true" :columns="getEntityFields('Prescription', 'listable')"
        idCol="prescriptionId" :searches="getEntityFields('Prescription', 'searchable')" :searchMethod="onSearch"
        :actions="actions" @action="defaultActionProc">
        <template #expand="scope">
            <PrescriptionComponent :prescription="scope.data" />
        </template>
    </SimpleTable>
</template>

<script>
import SimpleTable from '@/components/SimpleTable.vue';
import { visitApi } from '@gcp/visit/visit_api';
import PrescriptionComponent from '@gcp/visit/prescription_component.vue';
import { defaultActionProc } from '@/utils/utils';
import { rootPath } from '@gcp/router';

export default {
    props: {
        visitId: { default: () => null },
    },
    watch: {
        'visitId': {
            async handler(newVal) {
                this.initVisitId(newVal);
            },
        },
    },
    components: { SimpleTable },
    data() {
        return {
            actions: [
                {
                    desc: "详情",
                    method: 'onProjectDetail',
                },
            ]
        }
    },
    methods: {
        defaultActionProc,
        onProjectDetail(project) {
            this.$router.push(`${rootPath}/projects/${project.projectId}`)
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