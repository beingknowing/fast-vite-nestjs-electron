<template>
<div class="credentials-container">
  <Teleport to="body">
    <div v-if="successVisible" class="global-toast">
      <el-alert title="凭据已清空" type="success" show-icon :closable="false" />
    </div>
  </Teleport>

  <el-dialog v-model="clearDialogVisible" title="清空确认" width="360px" :append-to-body="true" align-center>
    <span>确定要清空所有凭据吗？</span>
    <template #footer>
      <el-button @click="clearDialogVisible = false">取消</el-button>
      <el-button type="danger" @click="confirmClear">确定</el-button>
    </template>
  </el-dialog>

  <div class="toolbar">
    <el-text>共 {{ tableData.length }} 组凭据</el-text>
    <div class="toolbar-actions">
      <el-button type="primary" :disabled="!hasChanges" @click="handleSaveAll">保存</el-button>
      <el-button type="danger" :disabled="tableData.length === 0" @click="handleClear">清空凭据</el-button>
    </div>
  </div>

  <el-table :data="tableData" border row-key="env" table-layout="auto">
    <el-table-column label="当前" width="100">
      <template #default="{ row }">
        <el-radio :model-value="currentKey" :label="row.env" @change="() => setCurrent(row.env)">
          {{ row.isCurrent ? '使用中' : '设置' }}
        </el-radio>
      </template>
    </el-table-column>

    <el-table-column label="环境" width="90">
      <template #default="{ row }">
        <el-tag :type="getEnvTagType(row.env)">{{ row.env }}</el-tag>
      </template>
    </el-table-column>

    <el-table-column label="Client ID">
      <template #default="{ row }">
        <span v-if="!row.editing">{{ row.client_id }}</span>
        <el-input v-else v-model="row.client_id" size="small"></el-input>
      </template>
    </el-table-column>

    <el-table-column label="Client Secret">
      <template #default="{ row }">
        <span v-if="!row.editing">******</span>
        <el-input v-else v-model="row.client_secret" size="small" type="password"></el-input>
      </template>
    </el-table-column>

    <el-table-column label="操作" width="80">
      <template #default="{ row }">
        <el-button @click="handleEdit(row)">编辑</el-button>
      </template>
    </el-table-column>
  </el-table>


</div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCredentialStore } from '@render/stores/credentials'
import type { CredentialItem } from '@/types/orm_types'
import { getEnvTagType } from '@render/utils/env-tag'

definePage({
  meta: {
    label: '凭据管理',
    description: '维护 Client ID、Secret 与主机地址',
    parent: '/settings',
    parentLabel: '设置',
    parentOrder: 3,
    order: 200
  }
})

const store = useCredentialStore()
const { tableData, currentKey } = storeToRefs(store)
const { handleEdit, setCurrent } = store

const clearDialogVisible = ref(false)
const successVisible = ref(false)
const baselineSnapshot = ref('')

const snapshotTable = (rows: CredentialItem[]): string => {
  return JSON.stringify(rows.map((row) => ({
    env: row.env,
    isCurrent: Boolean(row.isCurrent),
    client_id: row.client_id ?? '',
    client_secret: row.client_secret ?? '',
    sn_host: row.sn_host ?? '',
  })))
}

const hasChanges = computed(() => snapshotTable(tableData.value) !== baselineSnapshot.value)

const syncBaseline = () => {
  baselineSnapshot.value = snapshotTable(tableData.value)
}

const loadCredential = async () => {
  await store.loadCredential()
  syncBaseline()
}

const handleSaveAll = async () => {
  if (!hasChanges.value) return
  await store.handleSaveAll()
  syncBaseline()
}

function showSuccess() {
  successVisible.value = true
  setTimeout(() => { successVisible.value = false }, 2500)
}

const handleClear = () => {
  clearDialogVisible.value = true
}

const confirmClear = async () => {
  clearDialogVisible.value = false
  await store.clearCredential()
  await loadCredential()
  showSuccess()
}

onMounted(async () => {
  await loadCredential()
})
</script>

<style scoped>
.credentials-container {
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

.global-toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 300px;
}
</style>