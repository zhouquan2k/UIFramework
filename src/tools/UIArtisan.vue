<template>
    <div>
        <el-container style="width:100%;height:100%">
            <el-header height="0">Header</el-header>
            <el-container>
                <el-aside width="250px" style="height:100%;padding:5px;">
                    <el-tree ref="tree" :data="tree" :props="treeProps" @node-click="onSelectNode" default-expand-all highlight-current :expand-on-click-node="false" node-key="id"></el-tree>
                </el-aside>
                <el-main>
                    <component ref="dynamicComponent" :is="dynamicComponent" v-bind="componentProps"></component>
                </el-main>
            </el-container>
        </el-container>
        <el-drawer direction="rtl" :visible.sync="showProperties" :modal="false">
            <el-form>
            <el-cascader v-model="newComponentType" :options="componentsByCategory" @change="onCreateChild" :show-close="false" :withHeader="false" placeholder=" + 新建 " style="width:100px; margin:15px" :props="{ expandTrigger: 'hover' }" />
            <el-button @click="onDelete"> - 删除</el-button>
            <el-descriptions class="margin-top" title="" :column="1" size="small" style="margin:10px" border>
                <template slot="extra">
                </template>
                <el-descriptions-item v-for="property in componentsByType[selectedNode?.name]?.properties ?? []" :key="property.name">
                    <template slot="label">{{property.name}}</template>
                    <div style="width:100%;height:20px" v-if="editingProperty!=property.name" @dblclick="onEdit(property)">{{selectedNode.properties?.[property.name]}}</div>
                    <el-input class="no-border property-edit" v-else-if="['String','Integer'].includes(property.type)" v-model="selectedNode.properties[property.name]"></el-input>
                    <DictionarySelect class="property-edit" v-else-if="['Boolean'].includes(property.type)" v-model="selectedNode.properties[property.name]" dictionary="Boolean" @change="onChange"></DictionarySelect>
                    <el-popover v-else-if="['Columns'].includes(property.type)" placement="left" v-model="showPopover">
                        <div>
                            <div style="display:flex"><DictionarySelect v-model="entity" dictionary="AllEntities" style="margin:5px;"></DictionarySelect>
                            <el-switch v-model="customColumns" style="margin-top:5px;" inactive-text="选择列"/></div>
                            <div v-if="customColumns">
                                <el-checkbox-group v-model="selectedColumns">
                                    <div class="column" v-for="column in (entity ? $metadata.entitiesMap[entity]?.fields : [])">
                                        <el-checkbox  :key="column.name" :label="column.name">{{column.name}}</el-checkbox>
                                    </div>
                                </el-checkbox-group>
                            </div>
                            <div>
                                <el-button type="primary" size="mini" @click="onSelectColumns">确定</el-button>
                                <el-button size="mini" type="text" @click="showPopover = false;editingProperty = null;">取消</el-button>
                                
                            </div>
                        </div>
                        <!--el-button slot="reference">编辑</el-button-->
                    </el-popover>
                </el-descriptions-item>
            </el-descriptions> 
            <el-button type="primary" native-type="submit" v-show="false" @click.prevent="onChange"/>
            </el-form>
        </el-drawer>
    </div>
</template>

<script>
import UIArtisanApi from '@/tools/UIArtisan.js';
import DictionarySelect from '@/components/dictionary_select.vue';
// import PrescriptionComponent from '@gcp/visit/prescription_component.vue';


const uiPath = "@gcp/medicine_warehouse/outbound_print.vue";
export default {
    name: 'UIArtisan',
    watch: {
        /*
        'visitId': {
            async handler(newVal) {
                this.initVisitId(newVal);
            },
        },
        */
    },
    computed: {
        dynamicComponent() {
            // return () => import ('@gcp/project_list.vue');
            //console.log(`@user/${this.componentPath}`);
            return (resolve) => require(["@gcp/medicine_warehouse/outbound_print.vue"], resolve);
            // return  (resolve) => require([str], resolve);
            //return import (`@user/${str}`);
            // return () => import (this.componentPath);

        },
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
            return Object.values(categories);
        }

    },
    components: { DictionarySelect},
    data() {
        return {
            tree: [],
            treeProps: {
                children: 'children',
                label: 'name'
            },
            componentProps: {
                prop_transactionId: '6',
            },
            entity: null,
            selectedNode: null,
            selectedElement: null,
            selectedElementOriginColor: null,
            uiPath,
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
        }
    },
    methods: {
        async refreshTree() {
            this.nodeById = {};
            this.tree = [await this.uiArtisanApi.getTree()];
            // populate nodeById by visit each node of the tree
            const visitNode = (node) => {
                this.nodeById[node.id] = node;
                if (node.children) {
                    node.children.forEach(visitNode);
                }
            }
            visitNode(this.tree[0]);
        },
        onEdit(property) {
            this.editingProperty = property.name;
            this.showPopover = true;
            
        },
        async onChange() {
            console.log(`${this.editingProperty} = '${this.selectedNode.properties[this.editingProperty]}'`);
            await this.uiArtisanApi.updateComponent(this.selectedNode, this.editingProperty);
            this.editingProperty = null;
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
            const element = document.getElementById(node.id);
            if (this.selectedElement) {
                this.selectedElement.style.border = this.selectedElementOriginColor;
            }
            this.selectedNode = node;
            this.showProperties = true;
            if (!element) {
                return;
            }
            this.selectedElement = element;
            this.selectedElementOriginColor = element.style.border;
            element.style.border = "2px solid red";

            // this.$refs.dynamicComponent.uiArtisanDesignTime('assignRolesVisible');
        },
        async onCreateChild() {
            await this.uiArtisanApi.createComponent(this.selectedNode.id, this.newComponentType[0], this.newComponentType[1]);
            this.newComponentType = [];
            this.refreshTree();
        },
        async onDelete() {
            await this.uiArtisanApi.deleteComponent(this.selectedNode.id);
        },
        addMasksToElements() {
            const elements = document.querySelectorAll('[id]');
            elements.forEach(el => {
                var id = el.id;
                if (!id.startsWith('w')) return;
                var level = Number(id.substring(1));
                // 检查是否已经添加了遮罩，避免重复添加
                if (!el.classList.contains('has-mask')) {
                // 为每个元素创建一个遮罩层
                    const mask = document.createElement('div');
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
                        this.onSelectNodeFromUI(id);
                        event.stopPropagation(); // 防止事件冒泡到被遮罩的元素
                    });

                    // 设置元素的position以确保遮罩层能够正确覆盖
                    const currentPos = window.getComputedStyle(el).position;
                    if (currentPos === 'static') {
                        el.style.position = 'relative';
                    }

                    // 将遮罩层添加到元素中
                    el.appendChild(mask);

                    // 标记已添加遮罩，避免重复操作
                    el.classList.add('has-mask');
                }
            });
        }
    },
    async mounted() {
        this.uiArtisanApi = new UIArtisanApi(uiPath);
        this.components = await this.uiArtisanApi.getComponents();
        this.componentsByType = this.components.reduce((types, component) => {
            types[component.name] = component;
            return types;
        }, {});
        await this.refreshTree();
        this.$nextTick(() => {
            this.addMasksToElements();
        });
    },
}
</script>

<style lang="scss" scoped>
.el-tree ::v-deep {
    .el-tree-node.is-current .el-tree-node__content {
        background-color: #67c23a;
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

.property-edit {
    height:20px;
    margin-bottom:10px;
}

.el-descriptions ::v-deep {
    .el-descriptions-item__label {
        width: 100px;
        height: 35px;
        text-align: right;
        margin-right: 15px;
    }

    .el-descriptions-item__cell {
        padding: 3px 3px;
        height: 35px;
    }
}
</style>