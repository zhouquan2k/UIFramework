<template>
    <div>
        <div class="grid-toolbar" v-if="toolbarVisible">
            <div style="display: flex;width: 90%;">
                <i v-if="searches?.length > 0" class="el-icon-arrow-right"
                    style="color:#409EFF;margin-top:5px;margin-left:5px;" @click="searchVisible = !searchVisible"></i>
                <el-form v-show="searchVisible && searches?.length > 0" inline class="search-form" v-model="searchForm">
                    <!-- 可以根据searches 里面的成员看哪些是已经定制显示了的，从而不再绘制-->
                    <el-form-item v-for="field in searches" :key="field.name"
                        v-if="$scopedSlots[`searches-${field.name}`] || !field.hidden && ['ID', 'IDStr', 'Integer', 'String', 'Enum', 'Dictionary'].includes(field.type) && !searchParams[field.name]">
                        <template v-if="$scopedSlots[`searches-${field.name}`]">
                            <slot :name="`searches-${field.name}`"></slot>
                        </template>
                        <el-input v-model="searchForm[field.name]" v-else-if="['ID', 'IDStr'].includes(field.type)"
                            class="search-input" :placeholder="field.label" @keyup.enter.native="onSearch" />
                        <el-input v-model="searchForm[field.name]" v-else-if="['Integer'].includes(field.type)"
                            class="search-input" :placeholder="field.label" @keyup.enter.native="onSearch"></el-input>
                        <el-input v-model="searchForm[field.name]" v-else-if="['String'].includes(field.type)"
                            :placeholder="field.label" class="search-input" @keyup.enter.native="onSearch" />
                        <DictionarySelect :theClass="field.name" v-model="searchForm[field.name]"
                            :dictionary="field.typeName" v-else-if="['Enum', 'Dictionary'].includes(field.type)"
                            :placeholder="field.label" :clearable="true" :multiple="true" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" plain @click="onSearch">搜索</el-button>
                        <el-button @click="onReset">重置</el-button>
                        <el-button type="warning" plain @click="onExport">导出</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <slot name="buttons">
            </slot>
        </div>

        <el-table :key="tableUpdateKey" ref="table" class="main-table" :data="list" :row-key="idCol"
            :default-expand-all="false" @selection-change="handleSelectionChange" @row-dblclick="handleDblClick"
            :row-class-name="rowClassName" @expand-change="row => $emit('expand-change', row)"
            :empty-text="emptyText"
            :highlight-current-row="true"
            @current-change="row => $emit('current-change', row)"
            :summary-method="summaryMethod ?? defaultSummaryMethod"
            :show-summary="showSummary">
            <el-table-column v-if="checkboxVisible" type="selection" width="55" :default-expand-all="false" />
            <el-table-column type="expand" v-if="$scopedSlots['expand']" width="20">
                <template slot-scope="scope">
                    <slot name="expand" :data="scope.row" />
                </template>
            </el-table-column>
            <el-table-column :prop="field.name" :label="field.label" v-for="field in columns" :key="field.name"
                :width="field.colWidth" sortable>
                <template slot-scope="scope">
                    <template v-if="$scopedSlots[`columns-${field.name}`]">
                        <slot :name="`columns-${field.name}`" :data="scope.row"></slot>
                    </template>
                    <DictionaryTag v-else-if="['Enum', 'Dictionary'].includes(field.type) && scope.row[field.name]"
                        :value="scope.row[field.name]" :dictName="field.typeName" tag />
                    <span v-else-if="['RefID'].includes(field.type) && scope.row[field.name]">
                        {{ field.refData && field.refData.startsWith('dictionary:') ?
                            dictionariesMap[field.refData.substring(11)]?.[scope.row[field.name]]?.label :
                            safeGet(scope.row,
                                field.refData) }}</span>
                    <span v-else-if="['Date', 'Timestamp'].includes(field.type)">{{ dateFormatter(0, 0,
                        safeGet(scope.row, field.name), field)
                    }}</span>
                    <span v-else>{{ safeGet(scope.row, field.name) }}</span>
                </template>
            </el-table-column>
            <el-table-column v-if="actions && actions.length > 0" label="操作" fixed="right" width="150">
                <template slot-scope="scope">
                    <el-button :name="`${action.desc}`"
                        v-for="action in availableActions(scope.row).slice(0, actionCntToHide)"
                        :key="`button-${action.event}`" v-if="!action.available || action.available(scope.row)" type="text"
                        :style="action.style" @click="callMethod(action.event, scope.row)">{{ action.desc
                        }}</el-button>
                    <el-dropdown v-if="availableActions(scope.row).length > actionCntToHide"
                        @command="command => callMethod(command, scope.row)">
                        <span class="el-dropdown-link">
                            更多<i class="el-icon-d-arrow-right el-icon--left" />
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item v-for="action in availableActions(scope.row).slice(actionCntToHide)"
                                :command="action.event" v-if="!action.available || action.available(scope.row)" size="mini"
                                type="text" :icon="action.icon" :key="action.name">{{
                                    action.desc
                                }}</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
  
<script>
import { dateFormatter, safeGet, hasPermission, dictFormatter } from "@/utils/utils";
import DictionarySelect from '@/components/dictionary_select';
import DictionaryTag from '@/components/dictionary_tag.vue';
import * as XLSX from 'xlsx';
export default {
    name: 'SimpleTable',
    props: {
        idCol: { default: () => 'id' },
        columns: { type: Array },
        searchMethod: { type: Function },
        actions: { type: Array, default: () => ([]) },
        buttons: { type: Array, default: () => ([]) },
        searches: { type: Array, default: () => ([]) },
        searchParams: { type: Object, default: () => ({}) },
        fixedSearchParams: { type: Object, default: () => ({}) },
        toolbarVisible: { type: Boolean, default: () => true },
        searchVisible: { type: Boolean, default: () => false },
        checkboxVisible: { type: Boolean, default: () => false },
        actionCntToHide: { type: Number, default: () => 2 },
        rowClassName: { default: () => null }, //function or string, pass 
        emptyText: { default: () => null },
        summaryMethod: {default: () => null},
        showSummary: {default: () => false},
    },
    watch: {
        searchParams: {
            handler(newVal) {
                //if (this.autoSearch)
                this.onSearch();
            },
            deep: true,
        }
    },
    components: { DictionarySelect, DictionaryTag },
    data() {
        return {
            searchForm: {},
            list: [],

            dateFormatter, safeGet,
            tableUpdateKey: 2617,
        };
    },
    methods: {
        onExport() {
            // TODO call searchMethod get whole data instead of current page
            const headers = this.columns.map(col => col.label);
            const data = this.list.map(row => this.columns.map(col => {
                if (col.type === 'Enum' || col.type === 'Dictionary')
                    return this.dictFormatter(col.typeName, row[col.name]);
                return row[col.name];
            }));
            // 创建工作簿
            const wb = XLSX.utils.book_new();
            // 将数据转换为工作表
            const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
            // 将工作表添加到工作簿
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            // 导出工作簿（在浏览器环境中会触发下载）
            XLSX.writeFile(wb, "export.xlsx");
        },
        hasPermission,
        availableActions(param) {
            return this.actions.filter(action => !action.available || action.available(param));
        },
        callMethod(event, row) {
            // this.$emit('action', { name: methodName, params: params });
            this.$emit(event, row);
        },
        onReset() {
            this.searchForm = {};
            this.$emit('reset');
            this.onSearch();
        },
        async onSearch() {
            for (const key in this.searchForm) {
                if (this.searchForm[key] === "") delete this.searchForm[key];
            }
            for (const key in this.searchParams) {
                if (this.searchParams[key] === "") delete this.searchParams[key];
            }
            console.log('searching...', JSON.stringify(this.searchForm), JSON.stringify(this.searchParams));
            if (this.searchMethod)
                this.list = await this.searchMethod({...this.searchForm, ...this.searchParams, ...this.fixedSearchParams});
        },
        handleSelectionChange(data) {
            this.$emit('selection-change', data);
        },
        handleDblClick(data) {
            this.$emit('row-dblclick', data);
        },
        refreshTable() {
            this.tableUpdateKey++;
        },
        defaultSummaryMethod(param) {
            const { columns, data } = param;
            const sums = [];
            columns.forEach((column, index) => {
                if (index === 0) {
                    sums[index] = '记录数：' + data.length;
                    return;
                }
                /* TODO according to column metadata
                const values = data.map(item => Number(item[column.property]));
                if (!values.every(value => isNaN(value))) {
                    sums[index] = values.reduce((prev, curr) => {
                    const value = Number(curr);
                    if (!isNaN(value)) {
                        return prev + curr;
                    } else {
                        return prev;
                    }
                    }, 0);
                    // sums[index] += ' 元';
                } else {
                    // sums[index] = 'N/A';
                }
                */
            });

            return sums;
        }

    },
    created() {
        this.onSearch();
    }
};
</script>
  
<style lang="scss" scoped>
/*
# .el-form-item {
    margin-right: 10px;
}
*/

.el-dropdown-link {
    margin-left: 10px;
    font-size: 12px;
    color: #409EFF;
}

.search-form {
    margin-left: 10px;
    /* margin-right: auto; */
    margin-top: -2px;
    width: 100%;
    ::v-deep .el-button--small {
        padding: 9px 12px;
        margin-right: 8px;
        margin-left: 0px;
    }
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
  