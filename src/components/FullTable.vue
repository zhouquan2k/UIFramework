<template>
    <div>
        <SimpleTable ref="simple-table" :searchVisible="true" :columns="_columns" :searches="_searches"
            :searchMethod="searchMethod" :actions="actions" :searchParams="searchParams" v-on="$listeners"
            @edit="showEditDialog" @delete="showDeleteConfirm">
            <template
                v-for="slot in Object.keys($scopedSlots).filter(slot => slot.startsWith('simple-table_')).map(slot => slot.split('_')[1])"
                v-slot:[slot]="scope">
                <slot :name="`simple-table_${slot}`" :data="scope.data"></slot>
            </template>
            <template #buttons>
                <el-button type="success" @click="showAddDialog">+ 新建</el-button>
            </template>
            <!--template #columns-roles="scope">
            12345
            <slot name="simple-table_columns-roles" :data="scope.data"></slot>
        </template-->
        </SimpleTable>
        <el-dialog v-if="dialogVisible" :title="`${label} - ${dialogTitle}`" :visible.sync="dialogVisible">
            <DetailForm ref="detail-form" :name="entity" :detail="detail" :formCols="formCols" :mode="mode" />
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="save" v-if="mode != 'readonly'">确定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="确认删除" :visible.sync="deleteConfirmVisible">
            <span>确定删除该{{ label }}吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteConfirmVisible = false">取消</el-button>
                <el-button type="primary" @click="deleteRecord">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import SimpleTable from '@/components/SimpleTable.vue';
import { defaultCrudActions, initMetadata } from "@/utils/utils";
import UserSelect from '@user/components/user_select';
import DetailForm from '@/components/Crud/detail_form.vue';

export default {
    props: {
        entity: {},
        apis: {}, // create, update, delete, search
        label: { default: () => '' },
        actions: { default: () => defaultCrudActions },
        columns: { default: () => null },
        searches: { default: () => null },
        searchParams: { default: () => null },
        searchMethod: { default: () => null },
        formCols: { default: () => 2 },

    },
    components: { SimpleTable, UserSelect, DetailForm },
    computed: {
        _columns() {
            return !this.columns ? this.getEntityFields(this.entity, 'listable') : this.columns;
        },
        _searches() {
            return !this.searches ? this.getEntityFields(this.entity, 'seachable') : this.searches;
        }
    },
    data() {
        return {
            mode: null, //readyonly, create, update
            dialogVisible: false,
            deleteConfirmVisible: false,
            dialogTitle: '',
            detail: null,
        }
    },
    methods: {
        refresh() {
            this.$refs['simple-table'].onSearch();
        },
        showAddDialog(current) {
            this.detail = { parentId: current ? current[this.metadata.idField] : null };
            this.metadata.fields.filter(field => field.defaultValue).forEach(field => this.detail[field.name] = field.defaultValue);
            this.mode = 'create';
            this.dialogTitle = '新建';
            this.dialogVisible = true;
        },
        showEditDialog(row) {
            if (this.$defaultActionEmit('edit', row)) return;
            this.detail = row;
            this.mode = 'update';
            this.dialogTitle = '编辑';
            this.dialogVisible = true;
        },
        showDetailDialog(row) {
            this.detail = row;
            this.dialogTitle = '详情';
            this.mode = 'readonly';
            this.dialogVisible = true;
        },
        showDeleteConfirm(detail) {
            if (this.$defaultActionEmit('delete', row)) return;
            this.detail = detail;
            this.deleteConfirmVisible = true;
        },
        //save
        async save() {
            // TODO
            this.$refs['detail-form'].validate(async (valid) => {
                if (!valid) return false;
                let response;
                if (this.mode == 'update') {
                    response = await this.apis.update(this.detail[this.metadata.idField], this.detail);
                } else if (this.mode == 'create') {
                    response = await this.apis.create({ ...this.detail }); //...this.searchForm
                }
                this.$message.success('保存成功');
                await this.refresh();
                this.dialogVisible = false;
            });
        },
        async deleteRecord() {
            const response = await this.apis.delete(this.detail[this.metadata.idField]);
            this.$message.success('删除成功');
            this.refresh();
            this.deleteConfirmVisible = false;
        },

    },
    created() {
        initMetadata(this, null, this.entity);
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