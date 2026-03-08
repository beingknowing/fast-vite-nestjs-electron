<script setup lang="ts">

definePage({
    meta: {
        isAdmin: false,
        requiresAuth: false,
        label: '路由示例 · 一',
        description: '演示自动路由 ViewOne 页面'
    }
})

const test = () => {
    console.log('test')

}
</script>

<template>
<h1>ViewOne</h1>
<el-button @click="test">按钮</el-button>
</template>