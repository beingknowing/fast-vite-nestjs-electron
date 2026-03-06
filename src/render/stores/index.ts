
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(createPersistedState({
    sn_host: sn_host => `my-app-${sn_host}`,
    storage: window.localStorage,
    debug: true,
    auto: true,
}))

export default pinia