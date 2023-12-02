<template>
    <div>
        <div class="grid-toolbar">
            <div style="display: flex;width: 90%;">
                <el-button v-if="buttons.add" type="success" plain icon="el-icon-plus" size="mini" @click="showAddDialog"
                    v-hasPermi="['system:user:create']">新建</el-button>
                <!--el-button v-if="buttons.export" type="info" icon="el-icon-upload2" size="mini" @click="handleImport"
                    v-hasPermi="['system:user:import']">导入</el-button>
                <el-button v-if="buttons.export" type="warning" icon="el-icon-download" size="mini" @click="handleExport"
                    :loading="exportLoading" v-hasPermi="['system:user:export']">导出</el-button-->
                <slot name="buttons">
                </slot>
                <i v-if="metadata.searchFields?.length > 0" class="el-icon-arrow-right"
                    style="color:#409EFF;margin-top:5px;margin-left:5px;" @click="searchVisible = !searchVisible"></i>
                <el-form v-show="searchVisible && metadata.searchFields?.length > 0" inline class="search-form"
                    v-model="searchForm">
                    <slot name="searches">
                    </slot>
                    <!-- 可以根据searches 里面的成员看哪些是已经定制显示了的，从而不再绘制-->
                    <el-form-item v-for="field in seachableFields"
                        v-if="!field.hidden && ['ID', 'IDStr', 'Integer', 'String', 'Enum', 'Dictionary'].includes(field.type) && !searchParam[field.name]">
                        <el-input v-model="searchForm[field.name]" v-if="['ID', 'IDStr'].includes(field.type)"
                            class="search-input" :placeholder="field.label" />
                        <el-input v-model="searchForm[field.name]" v-if="['Integer'].includes(field.type)"
                            class="search-input" :placeholder="field.label"></el-input>
                        <el-input v-model="searchForm[field.name]" v-if="['String'].includes(field.type)"
                            :placeholder="field.label" class="search-input" />
                        <el-select v-model="searchForm[field.name]" v-if="['Enum', 'Dictionary'].includes(field.type)"
                            value="" :placeholder="field.label" class="search-input">
                            <el-option v-for="item in dictionaries[field.typeName]" :label="item.label" :value="item.value"
                                :key="`${field.name}-${item.value}`" />
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSearch">搜索</el-button>
                        <el-button @click="onReset">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <right-toolbar style="display: flex;" :showSearch.sync="searchVisible" @queryTable="getList"
                :columns="metadata.fields"></right-toolbar>
        </div>

        <el-table :key="tableUpdateKey" ref="table" class="main-table" :data="list" row-key="id" default-expand-all
            :tree-props="{ children: 'children' }" @selection-change="handleSelectionChange" @row-dblclick="handleDblClick"
            :row-class-name="rowClassName">
            <el-table-column v-if="checkbox" type="selection" width="55" />
            <el-table-column :prop="field.name" :label="field.label" v-for="field in metadata.fields"
                v-if="!field.hidden && field.listable && (!columns || columns.includes(field.name))" :key="field.name"
                sortable>
                <template slot-scope="scope">
                    <el-tag
                        v-if="['Enum', 'Dictionary'].includes(field.type) && scope.row[field.name] !== null && scope.row[field.name] !== undefined"
                        :type="dictionariesMap[field.typeName]?.[scope.row[field.name]]?.tag">{{
                            dictionariesMap[field.typeName]?.[scope.row[field.name]]?.label
                        }}</el-tag>
                    <span v-else-if="['RefID'].includes(field.type) && scope.row[field.name]">
                        {{ safeGet(scope.row, field.refData) }}</span>
                    <span v-else-if="['Date', 'Timestamp'].includes(field.type)">{{ dateFormatter(0, 0,
                        scope.row[field.name], field)
                    }}</span>
                    <div v-else-if="field.type == 'ToMany'">
                        <el-tag v-for="item in scope.row[field.name]">{{ getManyItemLabel(item, field) }}
                        </el-tag>
                    </div>
                    <span v-else>{{ scope.row[field.name] }}</span>
                </template>
            </el-table-column>
            <el-table-column v-if="actions && actions.length > 0" label="操作" fixed="right" width="200">
                <template slot-scope="scope">
                    <el-button v-for="   action    in    actions.slice(0, actionCntToHide)   "
                        v-if="!action.available || action.available(scope.row)" type="text" :style="action.style"
                        @click="callMethod(action.method, scope.row)">{{ action.desc
                        }}</el-button>
                    <el-dropdown v-if="actions.length > actionCntToHide"
                        @command="(command) => callMethod(command, scope.row)">
                        <span class="el-dropdown-link">
                            更多<i class="el-icon-d-arrow-right el-icon--left" />
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item v-for="   action    in    actions.slice(actionCntToHide)   "
                                :command="action.method" size="mini" type="text" :icon="action.icon"
                                v-hasPermi="['system:user:delete']">{{
                                    action.desc
                                }}</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination :hide-on-single-page="false" :total="list?.length" layout="prev, pager, next" />
        <el-dialog v-if="dialogVisible" :title="`${desc} - ${dialogTitle}`" :visible.sync="dialogVisible">
            <DetailForm ref="detail-form" :name="name" :detail="detail" :formCols="formCols" :isUpdate="isUpdate"
                :toManySelectData="toManySelectData" />
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="save">确定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="确认删除" :visible.sync="deleteConfirmVisible">
            <span>确定删除该{{ desc }}吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="deleteConfirmVisible = false">取消</el-button>
                <el-button type="primary" @click="deleteRecord">确定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
  
<script>
import { notImplemented, initMetadata, defaultCrudActions, dateFormatter, safeGet, getManyItemLabel } from "@/utils/utils";
import RightToolbar from "@/components/RightToolbar"
import DictionarySelect from '@/components/dictionary_select'
import DetailForm from './detail_form';
export default {
    name: 'Crud',
    props: {
        name: {},
        desc: {},
        apis: {},
        columns: { default: () => null },
        checkbox: { default: () => false },
        initList: { default: () => true, },
        actions: { default: () => defaultCrudActions },
        buttons: { default: () => ({ add: true, 'export': false }) },
        searchVisible: { default: () => false },
        searchParam: { default: () => ({}) }, //fixed search param
        searches: { default: () => { } }, // other search inputs
        extSearchMeta: { default: () => [] },
        formCols: { type: Number, default: 1 },
        actionCntToHide: { default: () => 2 },
        rowClassName: { default: () => null },
        toManySelectData: { default: () => ({}) },
    },
    watch: {
        apis: {
            async handler(newVal) {
                await this.getList();
            },
        },
        searches: {
            handler(newVal) {
                Object.assign(this.searchForm, newVal);
            },
            deep: true,
        }
    },
    computed: {
        seachableFields() {
            return [...this.metadata.searchFields, ...this.extSearchMeta];
        },
    },
    components: { RightToolbar, DictionarySelect, DetailForm },
    data() {
        return {
            metadata: { fields: [] },
            dictionariesMap: {},
            searchForm: {},

            list: [],
            detail: {},
            isUpdate: false,

            dialogVisible: false,
            dialogTitle: '',
            deleteConfirmVisible: false,
            exportLoading: false,

            dateFormatter, safeGet, getManyItemLabel,
            tableUpdateKey: 2617,
        };
    },
    methods: {
        callMethod(methodName, ...params) {
            this.$emit('action', { name: methodName, params: params });
        },
        onReset() {
            this.searchForm = {};
            this.onSearch();
        },
        // for compatible, rediect to onSearch
        async getList() {
            if (!this.apis) return;
            if (this.searchVisible)
                this.onSearch();
            else
                this.list = await this.apis.list({ idField: this.metadata.idField });

        },
        async onSearch() {
            for (const key in this.searchForm) {
                if (this.searchForm[key] === "") delete this.searchForm[key];
            }
            console.log('searching...', this.searchForm, this.searchParam);
            Object.assign(this.searchForm, this.searchParam);
            // if (Object.keys(this.searchForm).length == 0) return this.getList();
            this.list = await this.apis.search(this.searchForm, { idField: this.metadata.idField });
        },
        showAddDialog(current) {
            this.detail = { parentId: current ? current[this.metadata.idField] : null };
            this.dialogVisible = true;
            this.dialogTitle = '新建';
            this.isUpdate = false;

        },
        showEditDialog(detail) {
            this.detail = { ...detail };
            this.dialogVisible = true;
            this.dialogTitle = '编辑';
            this.isUpdate = true;
        },
        async save() {
            this.$refs['detail-form'].validate(async (valid) => {
                if (!valid) return false;
                let response;
                if (this.isUpdate) {
                    response = await this.apis.update(this.detail[this.metadata.idField], this.detail);
                } else {
                    response = await this.apis.create(this.detail);
                }
                this.$message.success('保存成功');
                await this.getList();
                this.dialogVisible = false;
            });
        },
        showDeleteConfirm(detail) {
            this.detail = detail;
            this.deleteConfirmVisible = true;
        },
        async deleteRecord() {
            const response = await this.apis.delete(this.detail[this.metadata.idField]);
            this.$message.success('删除成功');
            this.getList();
            this.deleteConfirmVisible = false;
        },
        handleImport() {
            notImplemented(this);
        },
        handleExport() {
            notImplemented(this);
        },
        handleSelectionChange(data) {
            this.$emit('selection-change', data);
        },
        handleDblClick(data) {
            this.$emit('row-dblclick', data);
        },
        refreshTable() {
            this.tableUpdateKey++;
        }
    },
    async created() {
        await initMetadata(this, this.apis, this.name);
        Object.assign(this.searchForm, this.searches);
        if (this.initList) this.getList();
    }
};
</script>
  
<style scoped>
.el-form-item {
    margin-right: 10px;
}

.el-dropdown-link {
    margin-left: 10px;
    font-size: 12px;
    color: #409EFF;
}

.search-form {
    margin-left: 10px;
    /* margin-right: auto; */
    margin-top: -2px;
    width: 100%
}

.search-input {
    width: 100px;
    line-height: 20px;
    height: 28px;
}

.search-input>>>.el-input--small .el-input__inner {
    height: 28px;
    line-height: 28px;
}

.grid-toolbar {
    display: flex;
    justify-content: space-between;
    height: 30px;
    margin-top: 3px;
    margin-bottom: 3px;
}
</style>
  