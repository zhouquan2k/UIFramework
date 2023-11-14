<template>
    <el-select :value="value" @change="onSelect">
        <el-option v-for="item in $metadata.dictionaries[dictionary]" :label="item.label" :value="item.value"
            :key="item.value" />
    </el-select>
</template>
<script>

export default {
    model: {
        prop: 'value',
        event: 'change'
    },
    props: {
        value: {},
        dictionary: {},
    },
    data() {
        return {
        };
    },
    methods: {
        onSelect(event) {
            this.$emit('change', event)
        }
    },
    async created() {
    }
};
</script>