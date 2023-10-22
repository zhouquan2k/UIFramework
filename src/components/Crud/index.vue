<template>
    <div>
        <el-row :gutter="10" class="grid-toolbar">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="showAddDialog"
                    v-hasPermi="['system:user:create']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="info" icon="el-icon-upload2" size="mini" @click="handleImport"
                    v-hasPermi="['system:user:import']">导入</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" :loading="exportLoading"
                    v-hasPermi="['system:user:export']">导出</el-button>
            </el-col>
            <right-toolbar :showSearch.sync="searchVisible" @queryTable="getList"
                :columns="metadata.fields"></right-toolbar>
        </el-row>
        <el-form v-if="metadata.searchFields?.length" v-show="searchVisible" inline class="search-form"
            v-model="searchForm">
            <el-form-item v-for="field in metadata.searchFields"
                v-if="!field.hidden && ['ID', 'IDStr', 'Integer', 'String', 'Enum', 'Dictionary'].includes(field.type)">
                <el-input v-model="searchForm[field.name]" v-if="['ID', 'IDStr'].includes(field.type)" class="search-input"
                    :placeholder="field.label" />
                <el-input v-model="searchForm[field.name]" v-if="['Integer'].includes(field.type)" class="search-input"
                    :placeholder="field.label"></el-input>
                <el-input v-model="searchForm[field.name]" v-if="['String'].includes(field.type)" :placeholder="field.label"
                    class="search-input" />
                <el-select v-model="searchForm[field.name]" v-if="['Enum', 'Dictionary'].includes(field.type)" value=""
                    :placeholder="field.label" class="search-input">
                    <el-option v-for="item in dictionaries[field.type == 'Enum' ? field.typeName : field.refData]"
                        :label="item.label" :value="item.value" :key="item.value" />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSearch">搜索</el-button>
                <el-button @click="onReset">重置</el-button>
            </el-form-item>
        </el-form>
        <el-table class="main-table" :data="list" row-key="id" default-expand-all :tree-props="{ children: 'children' }">
            <el-table-column :prop="field.name" :label="field.label" v-for="field in metadata.fields"
                v-if="!field.hidden && field.listable" :key="field.name" sortable>
                <template slot-scope="scope">
                    <span v-if="field.type == 'Enum'">{{ dictionariesMap[field.typeName][scope.row[field.name]] }}</span>
                    <span v-else-if="field.type == 'ToMany'">{{ scope.row[field.name]?.map(item =>
                        item[field.refData])?.join(" ") }}</span>
                    <span v-else>{{ scope.row[field.name] }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="280">
                <template slot-scope="scope">
                    <el-button v-for="action in actions.slice(0, 2)" type="text"
                        @click="callMethod(action.method, scope.row)">{{ action.desc
                        }}</el-button>
                    <el-dropdown v-if="actions.length > 2" @command="(command) => callMethod(command, scope.row)">
                        <span class="el-dropdown-link">
                            更多<i class="el-icon-d-arrow-right el-icon--left" />
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item v-for="action in actions.slice(2)" :command="action.method" size="mini"
                                type="text" :icon="action.icon" v-hasPermi="['system:user:delete']">{{ action.desc
                                }}</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination :hide-on-single-page="false" :total="list?.length" layout="prev, pager, next" />
        <el-dialog :title="`${desc} - ${dialogTitle}`" :visible.sync="dialogVisible">
            <el-form ref="detail-form" :model="detail" label-position="right" label-width="120px" :rules="rules"
                class="input-form">
                <el-row>
                    <el-col v-for="field in metadata.fields" :span="24 / formCols">
                        <el-form-item
                            v-if="!field.hidden && ['ID', 'IDStr', 'Integer', 'String', 'Enum', 'Dictionary'].includes(field.type)"
                            :label="field.label" :prop="field.name">
                            <span v-if="['ID', 'IDStr'].includes(field.type)">{{ detail[field.name] }}</span>
                            <el-input v-model="detail[field.name]" v-if="['Integer'].includes(field.type)"
                                style="width:100px;"></el-input>
                            <el-input v-model="detail[field.name]" v-if="['String'].includes(field.type)"></el-input>
                            <el-select v-model="detail[field.name]" v-if="['Enum', 'Dictionary'].includes(field.type)">
                                <el-option
                                    v-for="item in dictionaries[field.type == 'Enum' ? field.typeName : field.refData]"
                                    :label="item.label" :value="item.value" :key="item.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
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

import { notImplemented, getResult } from "@/utils/utils";
import RightToolbar from "@/components/RightToolbar"
export default {
    props: {
        name: {},
        desc: {},
        apis: {},
        actions: {},
        formCols: { type: Number, default: 1 }
    },
    components: { RightToolbar },
    data() {
        return {
            metadata: { fields: [] },
            dictionaries: {},
            dictionariesMap: {},
            idField: null,
            searchForm: {},
            rules: {},

            list: [],
            detail: {},

            dialogVisible: false,
            dialogTitle: '',
            deleteConfirmVisible: false,
            searchVisible: false,
            exportLoading: false,
        };
    },
    methods: {
        // TODO
        callMethod(methodName, ...params) {
            if (this.$parent[methodName])
                this.$parent[methodName](...params);
            else
                this[methodName](...params);
        },
        onReset() {
            this.searchForm = {};
            this.getList();
        },
        async getList() {
            this.list = await getResult(this.apis.list(), null, this.idField);
        },
        async onSearch() {
            if (Object.keys(this.searchForm).length == 0) return this.getList();
            this.list = await getResult(this.apis.search(this.searchForm), null, this.idField);
        },
        showAddDialog(current) {
            this.detail = { parentId: current ? current[this.idField] : null };
            this.dialogVisible = true;
            this.dialogTitle = '新建';

        },
        showEditDialog(detail) {
            this.detail = { ...detail };
            this.dialogVisible = true;
            this.dialogTitle = '编辑';
        },
        async save() {
            this.$refs['detail-form'].validate(async (valid) => {
                if (!valid) return false;
                let response;
                if (this.detail[this.idField]) {
                    response = await getResult(this.apis.update(this.detail[this.idField], this.detail));
                } else {
                    response = await getResult(this.apis.create(this.detail));
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
            const response = await getResult(this.apis.delete(this.detail[this.idField]));
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
        _addRule(name, rule) {
            if (!this.rules[name])
                this.rules[name] = [];
            this.rules[name].push(rule);
        }
    },
    async created() {
        const metadata = await getResult(this.apis.getMetadata());
        metadata.entitiesMap = metadata.entities.reduce((obj, item) => {
            obj[item.name] = item;
            return obj;
        }, {});
        this.metadata = metadata.entitiesMap[this.name];
        this.metadata.searchFields = this.metadata.fields.filter(field => field.searchable);
        this.idField = this.metadata.idField;
        this.metadata.fields.forEach(field => {
            if (!field.nullable && !field.hidden) this._addRule(field.name, { required: true, message: `请输入'${field.label}'`, trigger: 'blur' });
        });

        this.dictionaries = metadata.dictionaries;
        for (const [key, dict] of Object.entries(metadata.dictionaries)) {
            var dictMap = {}
            for (var item of dict) {
                dictMap[item.value] = item.label;
            }
            this.dictionariesMap[key] = dictMap;
        }
        this.getList();
    }
};
</script>
  
<style >
.el-form-item {
    margin-right: 10px;
}

.el-form-item--mini.el-form-item,
.el-form-item--small.el-form-item {
    margin-bottom: 5px;
}

.el-dropdown-link {
    margin-left: 10px;
    font-size: 12px;
    color: #409EFF;
}

.main-table th.el-table__cell {
    background-color: #f8f8f9;
}

.search-form {
    margin: 2px;
}

.search-input {
    width: 100px;
}

.grid-toolbar {
    margin: 10px;
}
</style>
  