import { defineStore } from 'pinia'
import { TicketResponse, TicketType } from '../../../../types/orm_types'
import { toRaw } from 'vue'

export const fieldLabels = {
    userName: '工单提交人',
    title: '工单简要标题',
    content: '工单详细描述',
    queue_val: '队列',
} as const

type FieldKey = keyof typeof fieldLabels
type ValidationMessages = Record<FieldKey, string>

const createEmptyValidationMessages = (): ValidationMessages => ({
    userName: '',
    title: '',
    content: '',
    queue_val: '',
})

const requiredFields: FieldKey[] = ['userName', 'title', 'content']

export const useTicketStore = defineStore('ticket', {
    state: () => ({
        ticket: {
            title: '',
            content: '',
            queue_val: '',
            userName: '',
        } as TicketType,
        validationMessages: createEmptyValidationMessages(),
        result: undefined as TicketResponse | undefined,
        isSubmitting: false,
    }),
    getters: {
        isFormValid: (state) =>
            requiredFields.every((field) => (state.ticket[field] ?? '').trim().length > 0),
    },
    actions: {
        setTicketField(field: FieldKey, value: string) {
            this.ticket[field] = value
        },
        resetValidationMessages() {
            this.validationMessages = createEmptyValidationMessages()
        },
        validateTicket() {
            this.resetValidationMessages()
            let firstError = ''
            requiredFields.forEach((field) => {
                const value = (this.ticket[field] ?? '').trim()
                if (!value) {
                    const msg = `${fieldLabels[field]}不能为空`
                    this.validationMessages[field] = msg
                    if (!firstError) firstError = msg
                }
            })
            return firstError
        },
        setResult(payload?: TicketResponse) {
            this.result = payload
        },
        async submitTicket() {
            const validationError = this.validateTicket()
            if (validationError) {
                return validationError
            }

            try {
                this.isSubmitting = true
                this.setResult()
                const payload = toRaw(this.ticket)
                const res = await window.electron.ipcRenderer.invoke('ticket', payload)
                this.setResult(res)
                console.log('Submitting ticket:', payload, 'Queue:', payload.queue_val)
            } catch (error) {
                const message = error instanceof Error ? error.message : '提交失败，请稍后重试'
                return message
            } finally {
                this.isSubmitting = false
            }

            return undefined
        },
    },
})