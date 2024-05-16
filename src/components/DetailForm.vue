<template>
    <el-form ref="detail-form" :model="detail" label-position="right" label-width="120px" :rules="rules"
        class="input-form">
        <el-row v-if="formStyle == 'default'">
            <slot></slot>
        </el-row>
        <el-descriptions :column="formCols" border>
            <slot></slot>
        </el-descriptions>
    </el-form>
</template>
<script>
import { initMetadata, globalDateFormat } from '@/utils/utils';
import DictionarySelect from '@/components/dictionary_select.vue';
export default {
    name: 'DetailForm',
    props: {
        name: {},
        detail: {},
        formStyle: { type: String, default: () => 'default' },
        mode: {}, // create/update/readonly
        formCols: { type: Number, default: 1 },
        meta: { type: String, default: () => null },
        toManySelectData: { default: () => ({}) },
    },
    inject: {
        getCustomComponent: { default: {} }
    },
    provide() {
        return {
            value: this.detail,
            formCols: this.formCols,
            mode: this.mode,
            entity: this.meta,
            formStyle: this.formStyle,
        };
    },
    components: { DictionarySelect },
    data() {
        return {
            globalDateFormat,
            rules: {},
            metadata: null,
        };
    },
    methods: {
        validate(callback) {
            return this.$refs['detail-form'].validate(callback);
        }
    },
    async created() {
        await initMetadata(this, null, this.name);
    }
}
</script>