<script setup lang="ts">
import { ref, computed, reactive, toRaw } from 'vue'
import { ElMessage } from 'element-plus'
// Explicit .vue extension ensures module resolution consistency across environments

import { RouterView } from 'vue-router';
import { TicketResponse, TicketType } from '../../../types/orm_types';

type Option = { des: string; queue: string }

const options: Option[] = [
  { des: '域名申请、解析', queue: 'GBL-NETWORK DDI' },
  { des: 'China Support/update L1 KB', queue: 'CHN-WPO-APP SUPPORT' },
  { des: '本地应用运维', queue: 'CHN-LOCAL APP DEVOPS' },
  { des: 'China IICS Platform Support Queue and DL', queue: 'CHN-IICS PLATFORM SUPPORT' },
  { des: 'CHN-DEP NG APPROVAL', queue: 'CHN-DEP NG APPROVAL' },
  { des: 'VPN相关问题', queue: 'GBL-NETWORK VPN' },
]

const fieldLabels = {
  userName: '工单提交人',
  title: '工单简要标题',
  content: '工单详细描述',
  queue_val: '队列',
} as const
type FieldKey = keyof typeof fieldLabels

const validationMessages = reactive<Record<FieldKey, string>>({
  userName: '',
  title: '',
  content: '',
  queue_val: '',
})

const ticket = reactive<TicketType>({
  title: '',
  content: '',
  queue_val: '',
  userName: '',
})

const result = reactive<{ v?: TicketResponse }>({})
const requiredFields: FieldKey[] = ['userName', 'title', 'content']

const isFormValid = computed(() =>
  requiredFields.every((field) => (ticket[field] ?? '').trim().length > 0),
)

const querySearch = (query: string, cb: (results: Option[]) => void) =>
  cb(
    options.filter(
      (item) =>
        item.des.toLowerCase().includes(query.toLowerCase()) ||
        item.queue.toLowerCase().includes(query.toLowerCase()),
    ),
  )

window.electron.ipcRenderer.invoke('get-domain-user').then((userName) => {
  ticket.userName = userName
})

const link = computed(() =>
  result.v
    ? {
      txt: result.v.result[0].display_value,
      href: `${window.env.sn_host}/now/sow/record/incident/${result.v.result[0].sys_id}`,
    }
    : {
      txt: 'waiting...',
      href: `${window.env.sn_host}/now/sow/home`,
    },
)

const validateTicket = () => {
  let firstError = ''
  requiredFields.forEach((field) => {
    const value = (ticket[field] ?? '').trim()
    if (!value) {
      const msg = `${fieldLabels[field]}不能为空`
      validationMessages[field] = msg
      if (!firstError) firstError = msg
    } else {
      validationMessages[field] = ''
    }
  })
  if (firstError) {
    ElMessage.error(firstError)
    return false
  }
  return true
}

const information = reactive({
  host: window.env.sn_host,
})

const isSubmitting = ref(false)
const enableSubmitBtn = computed(() => isFormValid.value && !isSubmitting.value)

async function submitTicket() {
  if (!validateTicket()) return
  try {
    isSubmitting.value = true
    result.v = undefined
    result.v = await window.electron.ipcRenderer.invoke('ticket', toRaw(ticket))
    console.log('Submitting ticket:', ticket, 'Queue:', ticket.queue_val)
  } finally {

    isSubmitting.value = false
  }

}



</script>
<template>
  <RouterLink to="/settings/credentials">Settings</RouterLink>
  <RouterLink to="/routeTest/viewOne">ViewOne</RouterLink>
  <RouterLink to="/routeTest/viewTwo">ViewTwo</RouterLink>
  <RouterView />
  <hr />
  <el-card class="form-card" style="margin-top: 16px;width: 100%;height: 100%;">
    <el-text class="mx-1" type="primary">{{ information.host }}</el-text>
    <!-- user name -->
    <el-input v-model="ticket.userName" placeholder="请输入工单提交人" clearable show-word-limit maxlength="100" readonly />
    <p class="field-error" v-if="validationMessages.userName">{{ validationMessages.userName }}</p>

    <!-- title -->
    <el-input v-model="ticket.title" placeholder="请输入工单简要标题" clearable show-word-limit maxlength="100" />
    <p class="field-error" v-if="validationMessages.title">{{ validationMessages.title }}</p>

    <!-- content -->
    <el-input v-model="ticket.content" type="textarea" :rows="6" placeholder="请输入工单详细描述（支持换行）" clearable show-word-limit
      maxlength="1000" />
    <p class="field-error" v-if="validationMessages.content">{{ validationMessages.content }}</p>

    <!-- queue -->
    <el-autocomplete v-model="ticket.queue_val" :fetch-suggestions="querySearch" placeholder="请输入以筛选队列"
      value-key="queue">
      <template #default="scope">
        <div v-if="scope?.item" class="auto-item">{{ scope.item.des }}（{{ scope.item.queue }}）</div>
      </template>
    </el-autocomplete>
    <p class="field-error" v-if="validationMessages.queue_val">{{ validationMessages.queue_val }}</p>

    <el-button type="primary" :disabled="!enableSubmitBtn" @click="submitTicket">提交工单</el-button>
  </el-card>
  <el-card class="link-card" style="margin-top: 16px;width: 100%;height: 100%;">
    <div style="margin-bottom: 8px; font-weight: 600;"></div>

    <el-link :href="link.href" target="_blank">{{ link.txt }}</el-link>
  </el-card>
</template>

<style scoped>
.form-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 32px 40px;
}

.form-card :deep(.el-input),
.form-card :deep(.el-autocomplete),
.form-card :deep(.el-textarea) {
  width: 100%;
}

.form-card :deep(.el-input__wrapper),
.form-card :deep(.el-autocomplete .el-input__wrapper) {
  height: 48px;
  font-size: 16px;
  padding: 0 16px;
}

.form-card :deep(.el-textarea__inner) {
  min-height: 220px !important;
  font-size: 16px;
  line-height: 1.5;
}

.link-card :deep(.el-card__body) {
  padding: 24px;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
}

.field-error {
  color: #f56c6c;
  font-size: 12px;
  margin: -6px 0 4px;
}
</style>