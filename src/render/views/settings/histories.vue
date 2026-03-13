<template>
<div class="histories-container">
  <div class="toolbar">
    <el-text>共 {{ histories.length }} 条历史记录</el-text>
    <div class="toolbar-actions">
      <el-button :loading="loading" @click="loadHistories">刷新</el-button>
      <el-button type="danger" :disabled="histories.length === 0" @click="handleClear">清空历史</el-button>
    </div>
  </div>

  <el-table :data="histories" border stripe v-loading="loading" row-key="display_value" empty-text="暂无历史记录">
    <el-table-column label="#" width="60">
      <template #default="{ $index }">
        {{ $index + 1 }}
      </template>
    </el-table-column>
    <el-table-column label="环境" width="120">
      <template #default="{ row }">
        <el-tag :type="getType(row)">{{ getTxt(row) }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="单号" min-width="140" show-overflow-tooltip>
      <template #default="{ row }">
        <el-link type="primary" @click.prevent="openRecord(row.ticket_link)">{{ row.display_value }}</el-link>
      </template>
    </el-table-column>
    <el-table-column prop="createTime" label="时间" min-width="140" />


  </el-table>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { TicketResult } from '@/types/orm_types';

definePage({
  meta: {
    label: '单据历史',
    description: '查看单据历史记录',
    parent: '/settings',
    parentLabel: '设置',
    parentOrder: 3,
    order: 201
  }
})

const getType = (ticket: TicketResult): "primary" | "success" | "info" | "warning" | "danger" => {

  const txt = getTxt(ticket)

  if (txt == "pfeprod")
    return 'info'
  if (txt == "pfestg")
    return 'warning'
  if (txt == "pfetst")
    return 'warning'
  return 'warning'
}
const getTxt = (ticket: TicketResult): "pfetst" | "pfestg" | "pfeprod" => {

  if (ticket.record_link?.includes("pfetst")) {
    return "pfetst"
  }
  if (ticket.record_link?.includes("pfestg")) {
    return "pfestg"
  }
  if (ticket.record_link?.includes("pfeprod")) {
    return "pfeprod"
  }
  return 'pfetst'
}
const histories = ref<TicketResult[]>([])
const loading = ref(false)

const loadHistories = async () => {
  loading.value = true
  try {
    histories.value = await window.electron.getTicketHistory()
  } finally {
    loading.value = false
  }
}

const handleClear = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有历史记录吗？', '清空确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }

  await window.electron.clearTicketHistory()
  loadHistories()
  ElMessage.success('历史记录已清空')
}

const openRecord = (url: string) => {
  window.electron.openLink(url)
}

onMounted(loadHistories)
</script>

<style scoped>
.histories-container {
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
</style>