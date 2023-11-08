<template>
    <el-tag :type="$metadata.dictionariesMap[dictName]?.[value]?.tag">{{
        $metadata.dictionariesMap[dictName]?.[value]?.label
    }}
    </el-tag>
</template>
<script>
export default {
    props: {
        value: { required: true },
        dictName: { type: String, required: true },
    },
    data() {
        return {
        };
    },
}
</script>