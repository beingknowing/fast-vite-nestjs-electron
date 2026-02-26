<template>
  <div class="credentials-container">
    <el-table :data="tableData" border row-key="key">
      <el-table-column label="Cur">
        <template #default="{ row }">
          <el-radio v-model="currentKey" :label="row.key" @change="() => setCurrent(row.key)"></el-radio>
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
          <span v-if="!row.editing">{{ row.client_secret }}</span>
          <el-input v-else v-model="row.client_secret" size="small"></el-input>
        </template>
      </el-table-column>

      <el-table-column label="SN Host">
        <template #default="{ row }">
          <span v-if="!row.editing">{{ row.sn_host }}</span>
          <el-input v-else v-model="row.sn_host" size="small"></el-input>
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
import { storeToRefs } from 'pinia'
import { useCredentialStore } from '@/stores/credentials'

const store = useCredentialStore()
const { tableData, currentKey } = storeToRefs(store)
const { handleEdit, handleSave, setCurrent } = store
</script>