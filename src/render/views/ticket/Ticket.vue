<script setup lang="ts">
import { computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
// Explicit .vue extension ensures module resolution consistency across environments

import { storeToRefs } from 'pinia'
import { useTicketStore, fieldLabels } from '@/stores/ticket'

type Option = { des: string; queue: string }

const options: Option[] = [
    { des: '域名申请、解析', queue: 'GBL-NETWORK DDI' },
    { des: 'China Support/update L1 KB', queue: 'CHN-WPO-APP SUPPORT' },
    { des: '本地应用运维', queue: 'CHN-LOCAL APP DEVOPS' },
    { des: 'China IICS Platform Support Queue and DL', queue: 'CHN-IICS PLATFORM SUPPORT' },
    { des: 'CHN-DEP NG APPROVAL', queue: 'CHN-DEP NG APPROVAL' },
    { des: 'VPN相关问题', queue: 'GBL-NETWORK VPN' },
]
const ticketStore = useTicketStore()
const { ticket, validationMessages, isFormValid, result, isSubmitting } = storeToRefs(ticketStore)

const querySearch = (query: string, cb: (results: Option[]) => void) =>
    cb(
        options.filter(
            (item) =>
                item.des.toLowerCase().includes(query.toLowerCase()) ||
                item.queue.toLowerCase().includes(query.toLowerCase()),
        ),
    )

window.electron.ipcRenderer.invoke('get-domain-user').then((userName) => {
    ticketStore.setTicketField('userName', userName)
})

const link = computed(() =>
    result.value
        ? {
            txt: result.value.result[0].display_value,
            href: `${window.env.sn_host}/now/sow/record/incident/${result.value.result[0].sys_id}`,
        }
        : {
            txt: 'waiting...',
            href: `${window.env.sn_host}/now/sow/home`,
        },
)

const information = reactive({
    host: window.env.sn_host,
})

const enableSubmitBtn = computed(() => isFormValid.value && !isSubmitting.value)

async function submitTicket() {
    const errorMessage = await ticketStore.submitTicket()
    if (errorMessage) {
        ElMessage.error(errorMessage)
    }
}

</script>
<template>
    <el-card class="form-card" style="margin-top: 16px;width: 100%;height: 100%;">
        <el-text class="mx-1" type="primary">{{ information.host }}</el-text>
        <!-- user name -->
        <el-input v-model="ticket.userName" :placeholder="`请输入${fieldLabels.userName}`" clearable show-word-limit
            maxlength="100" readonly />
        <p class="field-error" v-if="validationMessages.userName">{{ validationMessages.userName }}</p>

        <!-- title -->
        <el-input v-model="ticket.title" :placeholder="`请输入${fieldLabels.title}`" clearable show-word-limit
            maxlength="100" />
        <p class="field-error" v-if="validationMessages.title">{{ validationMessages.title }}</p>

        <!-- content -->
        <el-input v-model="ticket.content" type="textarea" :rows="4" :placeholder="`请输入${fieldLabels.content}（支持换行）`"
            clearable show-word-limit maxlength="1000" />
        <p class="field-error" v-if="validationMessages.content">{{ validationMessages.content }}</p>

        <!-- queue -->
        <el-autocomplete v-model="ticket.queue_val" :fetch-suggestions="querySearch"
            :placeholder="`请输入以筛选${fieldLabels.queue_val}`" value-key="queue" clearable>
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
/* Styles all router links in your application */
a {
    text-decoration: none;
    /* Removes the default underline */
    color: #333;
    padding: 10px;
}

/* Styles on hover */
a:hover {
    color: #007bff;
    cursor: pointer;
    /* Ensures the hand cursor appears if not on an anchor tag */
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

.field-error {
    color: #f56c6c;
    font-size: 12px;
    margin: -6px 0 4px;
}
</style>