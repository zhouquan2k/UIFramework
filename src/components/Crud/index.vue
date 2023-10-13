<template>
    <div>
        <el-form v-show="searchVisible" inline>
            <el-form-item>
                <el-input placeholder="TODO用户名" v-model="searchName"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search">搜索</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="showAddDialog">新增</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="getList">刷新</el-button>
            </el-form-item>
        </el-form>
        <el-row :gutter="10" class="mb8">
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
        <el-table :data="list" height="500" style="width: 100%">
            <el-table-column :prop="field.name" :label="field.label" v-for="field in metadata.fields" v-if="!field.hidden"
                :key="field.name">
                <template slot-scope="scope">
                    <span>{{ field.type == 'Enum' ? dictionariesMap[field.typeName][scope.row[field.name]] :
                        scope.row[field.name] }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="250">
                <template slot-scope="scope">
                    <el-button v-for="action in actions.slice(0, 2)" type="text"
                        @click="callMethod(action.method, scope.row)">{{ action.desc
                        }}</el-button>
                    <el-dropdown @command="(command) => callMethod(command, scope.row)">
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
        <el-dialog :title="desc" :visible.sync="dialogVisible">
            <el-form :model="detail" label-position="right" label-width="120px">
                <el-form-item v-for="field in metadata.fields" v-if="!field.hidden" :label="field.label">
                    <span v-if="['ID', 'IDStr'].includes(field.type)">{{ detail[field.name] }}</span>
                    <el-input v-model="detail[field.name]" v-if="['String'].includes(field.type)"></el-input>
                    <el-select v-model="detail[field.name]" v-if="['Enum'].includes(field.type)">
                        <el-option v-for="item in dictionaries[field.typeName]" :label="item.label" :value="item.value"
                            :key="item.value" />
                    </el-select>
                </el-form-item>
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
    props: ['name', 'desc', 'apis', 'actions'],
    components: { RightToolbar },
    data() {
        return {
            metadata: { fields: [] },
            dictionaries: {},
            dictionariesMap: {},
            idField: null,

            list: [],
            detail: {},

            searchName: '',

            dialogVisible: false,
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
        async getList() {
            this.list = await getResult(this.apis.search({}));
        },
        async search() {
            this.list = await getResult(this.apis.search(this.searchName));
        },
        showAddDialog() {
            this.detail = {};
            this.dialogVisible = true;
        },
        showEditDialog(detail) {
            this.detail = { ...detail };
            this.dialogVisible = true;
        },
        async save() {
            let response;
            if (this.detail[this.idField]) {
                response = await getResult(this.apis.update(this.detail[this.idField], this.detail));
            } else {
                response = await getResult(this.apis.create(this.detail));
            }
            this.$message.success('保存成功');
            await this.getList();
            this.dialogVisible = false;
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
        }
    },
    async created() {
        const metadata = await getResult(this.apis.getMetadata());
        metadata.entitiesMap = metadata.entities.reduce((obj, item) => {
            obj[item.name] = item;
            return obj;
        }, {});
        this.metadata = metadata.entitiesMap[this.name];
        this.idField = this.metadata.idField;
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
  
<style scoped>
.el-form-item {
    margin-right: 10px;
}

.el-dropdown-link {
    margin-left: 10px;
    font-size: 12px;
    color: #409EFF;
}
</style>
  