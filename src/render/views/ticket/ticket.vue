<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

import { storeToRefs } from 'pinia'
import { useTicketStore, fieldLabels } from '@render/stores/ticket'
import { CredentialItem, TicketQueueOption } from '@/types/orm_types'
import { getEnvTagType } from '@render/utils/env-tag'

const electron = window.electron;
const route = useRoute()
const router = useRouter()

definePage({
    meta: {
        label: '工单中心',
        description: '创建并提交新的 ServiceNow 工单',
        order: 100 // top‑level first item
    }
})

const options = ref<TicketQueueOption[]>([])
const ticketStore = useTicketStore()
const { ticket, validationMessages, isFormValid, result } = storeToRefs(ticketStore)
const isSubmitting = ref(false);
const current = reactive<CredentialItem>({
    env: 'pfetst',
})
const credentialReady = ref(true)

onMounted(async () => {
    const [curr, userName, queueOptions] = await Promise.all([
        window.electron.getCurrent(),
        window.electron.getDomainUser(),
        window.electron.getTicketOptions(),
    ])
    Object.assign(current, curr)
    credentialReady.value = Boolean(
        curr.client_id?.trim() &&
        curr.client_secret?.trim() &&
        curr.sn_host?.trim(),
    )
    ticketStore.setTicketField('userName', userName)
    options.value = queueOptions

    const queryQueue = route.query.queue
    const queueValue = Array.isArray(queryQueue) ? queryQueue[0] : queryQueue
    if (typeof queueValue === 'string' && queueValue.trim()) {
        ticketStore.setTicketField('queue_val', queueValue.trim())
    }
})

const querySearch = (query: string, cb: (results: TicketQueueOption[]) => void) =>
    cb(
        options.value.filter(
            (item) =>
                item.des.toLowerCase().includes(query.toLowerCase()) ||
                item.queue.toLowerCase().includes(query.toLowerCase()),
        ),
    )


const link = computed(() =>
    result.value
        ? {
            txt: result.value?.result[0].display_value,
            href: `${current.sn_host}/now/sow/record/incident/${result.value.result[0].sys_id}`,
        }
        : {
            txt: 'waiting...',
            href: `${current.sn_host}/now/sow/home`,
        },
)

const enableSubmitBtn = computed(() => {
    return credentialReady.value && isFormValid.value && !isSubmitting.value

})

const submitErrorMessage = ref('')

function showSubmitError(message: string) {
    submitErrorMessage.value = message
    setTimeout(() => {
        submitErrorMessage.value = ''
    }, 2500)
}

async function submitTicket() {
    const errorMessage = await ticketStore.submitTicket()
    if (errorMessage) {
        showSubmitError(errorMessage)
    }
}

const goCredentialSetting = async () => {
    await router.push('/settings/credentials')
}

</script>
<template>
<div class="ticket-page-root">
    <Teleport to="body">
        <div v-if="submitErrorMessage" class="global-toast">
            <el-alert :title="submitErrorMessage" type="error" show-icon :closable="false" />
        </div>
    </Teleport>

    <el-card class="form-card">
        <div class="host-row">
            <el-text type="primary">Env:</el-text>
            <el-tag :type="getEnvTagType(current.env)">{{ current.env }}</el-tag>
            <el-text type="primary">Host: {{ current.sn_host }}</el-text>
        </div>

        <el-alert v-if="!credentialReady" type="warning" show-icon :closable="false">
            <template #title>当前环境凭据未配置，请先前往凭据管理完成设置</template>
            <template #default>
                <el-link type="warning" @click.prevent="goCredentialSetting">前往凭据管理</el-link>
            </template>
        </el-alert>
        <el-input v-model="ticket.userName" :placeholder="`请输入${fieldLabels.userName}`" clearable show-word-limit
            maxlength="100" />
        <p class="field-error" v-if="validationMessages.userName">{{ validationMessages.userName }}</p>

        <el-input v-model="ticket.title" :placeholder="`请输入${fieldLabels.title}`" clearable show-word-limit
            maxlength="100" />
        <p class="field-error" v-if="validationMessages.title">{{ validationMessages.title }}</p>

        <el-input v-model="ticket.content" type="textarea" :rows="4" :placeholder="`请输入${fieldLabels.content}（支持换行）`"
            clearable show-word-limit maxlength="1000" />
        <p class="field-error" v-if="validationMessages.content">{{ validationMessages.content }}</p>

        <el-autocomplete v-model="ticket.queue_val" :fetch-suggestions="querySearch"
            :placeholder="`请输入以筛选${fieldLabels.queue_val}`" value-key="queue" clearable>
            <template #default="scope">
                <div v-if="scope?.item" class="auto-item">{{ scope.item.des }}（{{ scope.item.queue }}）</div>
            </template>
        </el-autocomplete>
        <p class="field-error" v-if="validationMessages.queue_val">{{ validationMessages.queue_val }}</p>

        <el-button type="primary" :disabled="!enableSubmitBtn" @click="submitTicket">提交工单</el-button>

        <div style="margin-bottom: 8px; font-weight: 600;"></div>

        <el-link :href="link.href" target="_blank" @click.prevent="electron.openLink(link.href)">{{ link.txt
            }}</el-link>
    </el-card>
</div>
</template>

<style scoped>
a {
    text-decoration: none;
    color: #333;
    padding: 10px;
}

a:hover {
    color: #007bff;
    cursor: pointer;
}

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

.host-row {
    display: flex;
    align-items: center;
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

.field-error {
    color: #f56c6c;
    font-size: 12px;
    margin: -6px 0 4px;
}
</style>