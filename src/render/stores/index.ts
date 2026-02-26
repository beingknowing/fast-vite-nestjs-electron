
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(createPersistedState({
    key: key => `my-app-${key}`,
    storage: window.localStorage,
    debug: true,
    auto: true,
}))

export default pinia