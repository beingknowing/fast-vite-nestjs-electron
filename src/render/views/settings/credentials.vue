<template>
<div class="credentials-container">
  <el-table :data="tableData" border row-key="sn_host">
    <el-table-column label="Cur">
      <template #default="{ row }">
        <el-radio v-model="currentKey" :label="row.env" @change="() => setCurrent(row.env)"></el-radio>
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

    <el-table-column label="操作">
      <template #default="{ row }">
        <el-button @click="handleEdit(row)">编辑</el-button>
        <el-button type="primary" @click="() => handleSave(row)">保存</el-button>
      </template>
    </el-table-column>
  </el-table>
</div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCredentialStore } from '@render/stores/credentials'

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
const { handleEdit, handleSave, setCurrent } = store

onMounted(async () => {
  const cred = await window.electron.readCredential()
  store.setTableData(cred)
})
</script>