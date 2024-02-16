<template>
    <el-select :class="theClass" @change="onSelect" filterable :filter-method="filterMethod" :placeholder="placeholder"
        :value="value" :multiple="multiple" :clearable="clearable">
        <el-option v-for="item in dictionaryData" v-if="item.tag != 'invisible'" :label="item.label" :value="item.value"
            :key="item.value" />
    </el-select>
</template>
<script>
import pinyin from "pinyin";
export default {
    model: {
        prop: 'value',
        event: 'change',
    },
    props: {
        theClass: { default: () => null },
        emptyOption: { default: () => false },
        clearable: { default: () => true },
        value: {},
        multiple: { default: () => false },
        dictionary: { type: String }, // dictinaryName
        placeholder: { default: () => '' }
    },
    data() {
        return {
            dictionaryData: [],
        };
    },
    methods: {
        onSelect(event) {
            this.$emit('change', event)
        },
        filterMethod(val, param) {
            if (val && val != ' ') {
                this.dictionaryData = this.$metadata.dictionaries[this.dictionary].filter(item => {
                    let optionPinyin = pinyin(item.label, {
                        style: pinyin.STYLE_FIRST_LETTER
                    }).join('');
                    // 检查输入的拼音首字母是否匹配
                    return optionPinyin.indexOf(val.toLowerCase()) === 0;
                });
            } else {
                this.dictionaryData = this.$metadata.dictionaries[this.dictionary];
            }
        }
    },
    async created() {
        this.dictionaryData = this.$metadata.dictionaries[this.dictionary]
    }
};
</script>