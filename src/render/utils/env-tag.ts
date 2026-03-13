import type { CredentialItem } from '@/types/orm_types'

export type EnvTagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

export function getEnvTagType(env?: CredentialItem['env']): EnvTagType {
    if (env === 'pfeprod') return 'danger'
    if (env === 'pfestg') return 'warning'
    if (env === 'pfetst') return 'success'
    return 'info'
}
