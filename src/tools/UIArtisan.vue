<template>
    <div>
        <el-container style="width:100%;height:100%">
            <el-header height="40" class="header">
                <div style="font-weight: bold;margin:10px;flex:1">UI Artisan -
                    <el-select style="width:200px;margin-left:15px;" v-model="edittingUiIndex" @change="loadUi">
                        <el-option v-for="(ui, index) in edittingUis" :key="ui.path"
                            :label="ui.path.substring(ui.path.lastIndexOf('/') + 1)" :value="index"></el-option>
                    </el-select>
                </div>
                <div><el-button @click="onExploreData" style="margin: 5px;flex:1">Data..</el-button></div>
            </el-header>
            <el-container class="container">
                <el-aside class="sidebar" width="250">
                    <div style="height:40px">
                        <el-switch style="margin-left:10px;" v-model="mode" active-text="run"
                            inactive-text="design"></el-switch>
                    </div>
                    <el-tree ref="tree" :data="tree" :props="treeProps" @node-click="onSelectNode" highlight-current
                        :expand-on-click-node="false" node-key="id" :default-expanded-keys="expandedNodes"
                        :render-after-expand="false" @node-expand="node => expandedNodes.push(node.id)"
                        @node-collapse="node => expandedNodes = expandedNodes.filter(id => id != node.id)"></el-tree>
                </el-aside>
                <el-main>
                    <component ref="dynamicComponent" :is="dynamicComponent" :key="dynamicComponentKey"
                        v-bind="edittingUis[edittingUiIndex]?.props"></component>
                </el-main>
            </el-container>
        </el-container>
        <el-drawer direction="rtl" :visible.sync="showProperties" :modal="false" :size="200">
            <el-form>
                <el-cascader v-model="newComponentType" :options="componentsByCategory" @change="onCreateChild"
                    :show-close="false" :withHeader="false" placeholder=" + 新建 " style="width:100px; margin:15px"
                    :props="{ expandTrigger: 'hover' }" />
                <el-button @click="onDelete"> - 删除</el-button>
                <el-descriptions class="properties" :title="selectedNode?.name" :column="1" size="small"
                    style="margin:10px" border>
                    <template slot="extra">
                    </template>
                    <el-descriptions-item v-for="property in componentsByType[selectedNode?.type]?.properties ?? []"
                        :key="property.name">
                        <template slot="label">{{ property.name }}</template>
                        <div class="property">
                            <div class="display" v-if="editingProperty != property.name" @dblclick="onEdit(property)">
                                {{ selectedNode.properties?.[property.name] }}</div>
                            <el-input class="no-border property-edit"
                                v-else-if="['String', 'Integer'].includes(property.type)"
                                v-model="selectedNode.properties[property.name]"></el-input>
                            <DictionarySelect class="property-edit"
                                v-else-if="['Boolean', 'AllDictionaries', 'AllEntities'].includes(property.type)"
                                v-model="selectedNode.properties[property.name]" :dictionary="property.type"
                                @change="onChange">
                            </DictionarySelect>
                            <el-popover v-else-if="['Columns'].includes(property.type)" placement="left"
                                v-model="showPopover">
                                <div style="position: relative">
                                    <div style="display:flex">
                                        <DictionarySelect v-model="entity" dictionary="AllEntities" style="margin:5px;"
                                            :multiple="false">
                                        </DictionarySelect>
                                        <el-switch v-model="customColumns" style="margin-top:5px;"
                                            inactive-text="选择列" />
                                    </div>
                                    <div v-if="customColumns">
                                        <el-checkbox-group v-model="selectedColumns">
                                            <div class="column"
                                                v-for="column in (entity ? $metadata.entitiesMap[entity]?.fields : [])">
                                                <el-checkbox :key="column.name" :label="column.name">{{ column.name
                                                    }}</el-checkbox>
                                            </div>
                                        </el-checkbox-group>
                                    </div>
                                    <div>
                                        <el-button type="primary" size="mini" @click="onSelectColumns">确定</el-button>
                                        <el-button size="mini" type="text"
                                            @click="showPopover = false; editingProperty = null;">取消</el-button>
                                    </div>
                                </div>
                                <!--el-button slot="reference">编辑</el-button-->
                            </el-popover>
                            <el-button class="data-edit" v-if="['String'].includes(property.type)"
                                @click="editingProperty = property.name; dialogVisible = true;">D</el-button>
                        </div>
                    </el-descriptions-item>
                </el-descriptions>
                <el-button type="primary" native-type="submit" v-show="false" @click.prevent="onChange" />
            </el-form>
        </el-drawer>
        <el-dialog title="Entity Wizard" :visible.sync="entityWizardDialog" width="600" height="600">
            <DictionarySelect placeholder="Entities" dictionary="AllEntities" v-model="entityName"
                @change="onEntityChange" :multiple="false" /><el-button @click="onAutoSelect">Auto Select</el-button>
            <div style="height:500px; overflow-y: auto;">
                <el-tree show-checkbox ref="entityWizardEntityTree" :data="dataTree" :props="treeProps"
                    @node-click="onSelectDataNode" style="margin:10px" node-key="id">
                </el-tree>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="entityWizardDialog = false">取 消</el-button>
                <el-button type="primary" @click="onEntityWizard">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="数据浏览" :visible.sync="dialogVisible" width="600px" style="height: 400px">
            <el-autocomplete class="inline-input" v-model="dataName"
                :fetch-suggestions="(query, callback) => callback([{ value: 'transaction' }, { value: 'returnItems' }])"
                placeholder="请输入数据变量" highlight-first-item @select="onSelectData"></el-autocomplete>
            <DictionarySelect style="margin-left: 10px" placeholder="Dictionaries" dictionary="AllDictionaries"
                v-model="dictName" @change="onDictionaryChange" :multiple="false" />
            <DictionarySelect placeholder="Entities" dictionary="AllEntities" v-model="entityName"
                @change="onEntityChange" :multiple="false" />
            <div style="height:400px">
                <el-tree :data="dataTree" :props="treeProps" @node-click="onSelectDataNode"
                    style="margin:10px"></el-tree>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import UIArtisanApi from '@/tools/UIArtisan.js';
import DictionarySelect from '@/components/dictionary_select.vue';

const edittingUis = [
    {
        path: 'test.vue',
        props: {
        }
    },
    {
        path: 'medicine_warehouse/prescription_item_search.vue',
        props: {
            prop_medicine: { medicineId: '1322' },
        }
    },
    {
        path: 'medicine_warehouse/warehouse_return2.vue',
        props: {
            prop_transactionId: '1',
        }
    },
    {
        path: 'medicine_warehouse/outbound_print.vue',
        props: {
            prop_transactionId: '7',
        }
    }
];


export default {
    name: 'UIArtisan',
    watch: {
        'mode': {
            async handler(newVal) {
                if (newVal) {
                    this.onSelectNode(null);
                    this.removeMasks();
                } else {
                    this.addMasksToElements();
                }
            },
        },
    },
    computed: {
        componentsByCategory() {
            var currentComponent = this.componentsByType?.[this.selectedNode?.name];
            const categories = this.components.reduce((categories, component) => {
                if (!component.category) return categories;
                if (currentComponent?.child) {
                    if (currentComponent?.child && !currentComponent?.child.includes(component.name)) return categories;
                }
                if (!categories[component.category]) {
                    categories[component.category] = { label: component.category, value: component.category, children: [] };
                }
                categories[component.category].children.push({ ...component, value: component.name });
                return categories;
            }, {});
            if (currentComponent?.slots?.length > 0)
                categories['slots'] = { label: 'Slots', value: 'slots', children: currentComponent?.slots?.map(slot => ({ label: slot, value: slot })) ?? [] };
            categories['entities'] = {
                label: 'Entities',
                value: 'entities',
                children: [{ label: 'Wizard', value: 'wizard' }]
            }
            return Object.values(categories);
        },
        /*
        dataTree() {
            // convert datas[dataName] to a tree using recursive function
            var datas = this.$refs.dynamicComponent;
            if (!datas?.[this.dataName]) return [{name:'No data available'}];
            const convertToTree = (data) => {
                if (Array.isArray(data)) {
                    return data.map(item => {
                        return {
                            id: item.value,
                            name: item.label,
                            children: convertToTree(item.children)
                        }
                    });
                }
                return [];
            }
            return convertToTree(datas[this.dataName]);
        }
        */

    },
    components: { DictionarySelect },
    data() {
        return {
            edittingUis,
            edittingUiIndex: 0,
            dictName: null,
            tree: [],
            treeProps: {
                children: 'children',
                label: 'name'
            },
            entity: null,
            entityName: null,
            selectedNode: null,
            selectedElement: null,
            selectedElementOriginColor: null,
            uiArtisanApi: null,
            test: null,
            showProperties: false,
            newComponentType: [],
            components: [],
            componentsByType: {},
            editingProperty: null,
            customColumns: false,
            selectedColumns: [],
            showPopover: false,
            nodeById: {},
            dialogVisible: false,
            entityWizardDialog: false,
            entityWizardMode: null,
            dataName: null,
            dataTree: [{ name: 'No data available' }],
            mode: false,
            expandedNodes: [],
            dynamicComponentKey: null,
            dynamicComponent: null,
            selectedEntity: null,
            creatingWidget: null,
        }
    },
    methods: {
        onExploreData() {
            this.dialogVisible = true;
        },
        async refreshTree() {
            this.nodeById = {};
            this.tree = [await this.uiArtisanApi.getTree()];
            // populate nodeById by visit each node of the tree
            const visitNode = (node, level) => {
                if (level < 3 && node.id) this.expandedNodes.push(node.id);
                this.nodeById[node.id] = node;
                if (node.children) {
                    node.children.forEach(child => visitNode(child, level + 1));
                }
            }
            visitNode(this.tree[0], 0);
            console.log(this.expandedNodes)
            setTimeout(() => {
                this.addMasksToElements();
            }, 1000);
        },
        onEdit(property) {
            this.editingProperty = property.name;
            this.showPopover = true;

        },
        async onChange() {
            console.log(`${this.editingProperty} = '${this.selectedNode.properties[this.editingProperty]}'`);
            await this.uiArtisanApi.updateComponent(this.selectedNode, this.editingProperty);
            this.editingProperty = null;
            setTimeout(() => {
                this.addMasksToElements();
            }, 1000);
        },
        async onSelectColumns() {
            if (this.customColumns)
                this.selectedNode.properties[this.editingProperty] = `getEntityFields('${this.entity}',[${this.selectedColumns.map(column => "'" + column + "'").join(',')}])`;
            else
                this.selectedNode.properties[this.editingProperty] = `getEntityFields('${this.entity}','listable')`;

            this.showPopover = false;
            await this.onChange();
        },
        onSelectNodeFromUI(id) {
            var node = this.nodeById[id];
            if (node) {
                this.$refs.tree.setCurrentNode(node);
                this.onSelectNode(node);
            }
        },
        onSelectNode(node) {
            var tree = this.$refs.tree;
            const n = tree.getNode(node?.id); // 获取节点
            if (n) {
                tree.store.nodesMap[node.id].parent.expand(null, true); // 展开节点
            }

            if (this.selectedElement) {
                this.selectedElement.style.border = this.selectedElementOriginColor;
            }
            if (!node) return;
            var element = document.getElementById(node.id);
            this.selectedNode = node;
            this.showProperties = true;
            if (!element) {
                return;
            }
            this.selectedElement = element;
            this.selectedElementOriginColor = element.style.border;
            element.style.border = "2px dashed #e6a23c";
            if (this.selectedNode.properties.entity) this.entityName = this.selectedNode.properties.entity;
        },
        entityToTree(entity, mode, parentId, depth) {
            var props = entity.fields;
            return props.map(prop => ({
                id: `${parentId ? parentId + '.' : ''}${prop.name}`,
                name: `${prop.name} = ${prop.label}`,
                children: prop.type == 'None' && !prop.fullTypeName.startsWith('java.') && depth < 5 && this.$metadata.entitiesMap[prop.typeName] ? this.entityToTree(this.$metadata.entitiesMap[prop.typeName], mode, `${parentId ? parentId + '.' : ''}${prop.name}`, depth + 1) : null,
                disabled: mode == 'searches' && !prop.searchable,
            }));
        },
        convertToTree(data, parentId) {
            if (Array.isArray(data)) {
                return data.map((item, idx) => ({
                    id: `${parentId}[${idx}]`,
                    name: `[${idx}] = ${item && typeof item === 'object' ? '...' : item}`,
                    children: item && typeof item === 'object' ? this.convertToTree(item, `${parentId}[${idx}]`) : null
                }));
            }
            var props = Object.keys(data);
            return props.map(prop => ({
                id: `${parentId}.${prop}`,
                name: `${prop} = ${data[prop] && typeof data[prop] === 'object' ? '...' : data[prop]}`,
                children: data[prop] && typeof data[prop] === 'object' ? this.convertToTree(data[prop], `${parentId}.${prop}`) : null
            }));
        },
        onSelectData() {
            const datas = this.$refs.dynamicComponent;
            if (!datas?.[this.dataName]) return [{ name: 'No data available' }];
            this.dataTree = this.convertToTree(datas[this.dataName], this.dataName);
        },
        onSelectDataNode(node) {
            if (this.selectedNode)
                this.selectedNode.properties[this.editingProperty] = node.id;
            this.copyToClipboard(node.id);
            this.dialogVisible = false;
        },
        onDictionaryChange(value) {
            this.copyToClipboard(value);
        },
        onEntityChange(entityName) {
            this.selectedEntity = this.$metadata.entitiesMap[entityName];
            // TODO 支持级联属性的选择
            this.dataTree = this.entityToTree(this.selectedEntity, this.entityWizardMode, null, 0);

            // 全部替换可能会破坏已存在的微调，暂时不提供
            // const checkedNodes = this.selectedNode.children.map(child => ({ id: child.id }));
            // this.$refs.entityWizardEntityTree.setCheckedNodes(checkedNodes);
        },
        copyToClipboard(text) {
            // copy to clipboard
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    console.log('文本已经成功复制到剪切板');
                })
                    .catch(err => {
                        console.error('无法复制此文本：', err);
                    });
            }
            else {
                console.error('无法复制此文本0');
            }
        },
        async onCreateChild() {
            var category = this.newComponentType[0];
            var widget = this.newComponentType[1];
            this.creatingWidget = widget;
            this.newComponentType = [];
            if (category == 'entities') {
                if (this.entityName) this.onEntityChange(this.entityName);
                this.entityWizardMode = this.selectedNode.properties.slot;
                this.entityWizardDialog = true;
                return;
            }
            var newId = await this.uiArtisanApi.createComponent(this.selectedNode.id, category, widget);
            await this.refreshTree();
            setTimeout(() => {
                this.onSelectNodeFromUI(newId);
            }, 1000);
        },
        onAutoSelect() {
            const isList = this.entityWizardMode == 'columns';
            const checkedNodes = this.selectedEntity.fields.filter(field => field[isList ? 'listable' : 'searchable'] && !field.hidden).map(field => ({ id: field.name }));
            this.$refs.entityWizardEntityTree.setCheckedNodes(checkedNodes);
        },
        async onEntityWizard() {
            // const isList = this.selectedNode.properties.slot == 'columns';
            this.entityWizardDialog = false;
            this.newComponentType = [];
            const checked = this.$refs.entityWizardEntityTree.getCheckedNodes();
            for (const node of checked) {
                // const meta = this.selectedEntity.fields.find(field => field.name == node.id);
                const meta = this.selectedEntity.name + "." + node.id;
                await this.uiArtisanApi.createComponent(this.selectedNode.id, '?', '?', meta);
            };
            this.refreshTree();
        },
        async onDelete() {
            await this.uiArtisanApi.deleteComponent(this.selectedNode.id);
            this.refreshTree();
        },
        removeMasks() {
            var elements = document.querySelectorAll('[id^="mask-"]');
            elements.forEach(function (element) {
                element.remove();
            });
        },
        addMasksToElements() {
            const elements = document.querySelectorAll('[id]');
            console.log('enhanced elements: ' + elements.length);
            elements.forEach(el => {
                var id = el.id;
                if (!id.startsWith('w')) return;
                var level = Number(id.substring(1));
                // 检查是否已经添加了遮罩，避免重复添加
                if (true) { //!el.classList.contains('has-mask')
                    // 为每个元素创建一个遮罩层
                    const mask = document.createElement('div');
                    mask.id = 'mask-' + id;
                    Object.assign(mask.style, {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0)', // 半透明遮罩层
                        zIndex: '' + level, // 确保遮罩层位于顶层
                        cursor: 'pointer', // 改变鼠标样式以指示可点击
                    });

                    // 为遮罩层添加点击事件监听器
                    mask.addEventListener('click', (event) => {
                        console.log('click:' + id);
                        this.onSelectNodeFromUI(id);
                        event.stopPropagation(); // 防止事件冒泡到被遮罩的元素
                    });

                    // 设置元素的position以确保遮罩层能够正确覆盖
                    const currentPos = window.getComputedStyle(el).position;
                    if (currentPos === 'static') {
                        el.style.position = 'relative';
                    }

                    // 将遮罩层添加到元素中
                    if (el.localName == 'input')
                        el.parentElement.appendChild(mask);
                    else
                        el.appendChild(mask);

                    // 标记已添加遮罩，避免重复操作
                    el.classList.add('has-mask');
                }
            });
        },
        async loadUi() {
            const _uiPath = `@gcp/view/${this.edittingUis[this.edittingUiIndex]?.path}`;
            this.uiArtisanApi = new UIArtisanApi(_uiPath);
            this.dynamicComponent = () => import(`@gcp/view/${this.edittingUis[this.edittingUiIndex]?.path}`);
            this.dynamicComponentKey = _uiPath;
            await this.refreshTree();
        }
    },
    async mounted() {
        this.uiArtisanApi = new UIArtisanApi();
        this.components = await this.uiArtisanApi.getComponents();
        this.componentsByType = this.components.reduce((types, component) => {
            types[component.name] = component;
            return types;
        }, {});
        await this.loadUi();
    },
}
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    background: #eef1f6;
    height: 40px;
    align-items: center;
}

/* 设置按钮紧贴在当前所在父节点的右侧，高度与父节点相同 */
.container {
    display: flex;
    height: 100vh;

    .sidebar {
        width: 250px;
        overflow-y: auto;
        height: 100vh;
        padding: 5px;
    }

    .el-main {
        padding: 5px;
    }
}

.property {
    position: relative;
    width: 100%;
    height: 100%;
    margin-left: 5px;
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;

    .property-edit {
        height: 20px;
        margin-bottom: 10px;

        ::v-deep .el-input__inner {
            background-color: #fdf6ec;
        }
    }


    /* 垂直居中 */
    .display {
        overflow-x: auto;
        width: 95px;
        height: 100%;
        white-space: nowrap;
        margin-right: 15px;
        display: flex;
        align-items: center;
    }

    .data-edit {
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        width: 16px;
        background-color: #409EFF;
        color: white;
        font-size: 12px;
        text-align: center;
        cursor: pointer;
        padding: 1px 1px;
    }
}


.el-tree ::v-deep {
    .el-tree-node.is-current .el-tree-node__content {
        background-color: #faecd8;
    }
}

.el-drawer__wrapper ::v-deep {
    .el-drawer__header {
        display: none;
    }
}

.column {
    text-align: left;
}

.no-border ::v-deep .el-input__inner {
    border: none !important;
    padding-left: 5px;
    width: 100%;
}


.properties ::v-deep {
    .el-descriptions-item__label {
        width: 50px;
        height: 35px;
        text-align: right;
        margin-right: 15px;
    }

    .el-descriptions-item__content {
        width: 150px;
        height: 35px;
        padding: 0px;
        word-break: unset;
    }
}
</style>