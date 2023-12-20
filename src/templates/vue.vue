<template>
    <Crud ref="crud" desc="检验/检查" name="VisitAction" :apis="projectApi" :searchVisible="true" @action="defaultActionProc"
        :actions="actions">
    </Crud>
</template>
<script>
import Crud from '@/components/Crud';
import projectApi from '@gcp/project_api';
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
    components: { Crud },
    data() {
        return {
            projectApi,
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