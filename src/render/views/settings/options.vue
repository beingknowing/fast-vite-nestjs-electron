<template>
<div class="options-container">
    <Teleport to="body">
        <div v-if="noticeText" class="global-toast">
            <el-alert :title="noticeText" :type="noticeType" show-icon :closable="false" />
        </div>
    </Teleport>

    <div class="toolbar">
        <el-text>共 {{ options.length }} 条队列配置</el-text>
        <div class="toolbar-actions">
            <el-button :loading="loading" @click="loadOptions">刷新</el-button>
            <el-button type="warning" :disabled="loading || adding" @click="handleReset">恢复默认</el-button>
        </div>
    </div>

    <el-card>
        <div class="add-form">
            <el-input v-model="newOption.des" placeholder="描述 (des)" />
            <el-input v-model="newOption.queue" placeholder="队列 (queue)" />
            <el-button type="primary" :loading="adding" @click="handleAdd">新增</el-button>
        </div>
    </el-card>

    <el-table :data="options" border row-key="queue" v-loading="loading" empty-text="暂无队列配置">
        <el-table-column prop="des" label="描述" min-width="220" show-overflow-tooltip />
        <el-table-column prop="queue" label="队列" min-width="220" show-overflow-tooltip />
        <el-table-column label="操作" width="90">
            <template #default="{ row }">
                <el-button type="danger" @click="handleDelete(row.queue)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { TicketQueueOption } from '@/types/orm_types'

definePage({
    meta: {
        label: '队列配置',
        description: '维护 ticket queue 与描述映射',
        parent: '/settings',
        parentLabel: '设置',
        parentOrder: 3,
        order: 202,
    }
})

const options = ref<TicketQueueOption[]>([])
const loading = ref(false)
const adding = ref(false)

const newOption = reactive<TicketQueueOption>({
    des: '',
    queue: '',
})

const noticeText = ref('')
const noticeType = ref<'success' | 'error'>('success')

function showNotice(type: 'success' | 'error', text: string) {
    noticeType.value = type
    noticeText.value = text
    setTimeout(() => {
        noticeText.value = ''
    }, 2500)
}

const loadOptions = async () => {
    loading.value = true
    try {
        options.value = await window.electron.getTicketOptions()
    } finally {
        loading.value = false
    }
}

const handleAdd = async () => {
    const des = newOption.des.trim()
    const queue = newOption.queue.trim()
    if (!des || !queue) {
        showNotice('error', '请先填写 des 和 queue')
        return
    }

    adding.value = true
    try {
        await window.electron.addTicketOption({ des, queue })
        newOption.des = ''
        newOption.queue = ''
        await loadOptions()
        showNotice('success', '新增成功')
    } finally {
        adding.value = false
    }
}

const handleDelete = async (queue: string) => {
    await window.electron.deleteTicketOption(queue)
    await loadOptions()
    showNotice('success', '删除成功')
}

const handleReset = async () => {
    await window.electron.resetTicketOptions()
    await loadOptions()
    showNotice('success', '已恢复默认列表')
}

onMounted(loadOptions)
</script>

<style scoped>
.options-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.toolbar-actions {
    display: flex;
    gap: 8px;
}

.add-form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 8px;
}

.global-toast {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    min-width: 300px;
}
</style>
