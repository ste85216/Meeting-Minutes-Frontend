import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import UserRole from '@/enums/UserRole.js'
import { useApi } from '@/composables/axios'

export const useUserStore = defineStore('user', () => {
  const { api, apiAuth } = useApi()

  const token = ref('')
  const email = ref('')
  const name = ref('')
  const avatar = ref('')
  const role = ref(UserRole.USER)
  const userId = ref('')

  const isLogin = computed(() => token.value.length > 0)
  const isAdmin = computed(() => role.value === UserRole.ADMIN)

  const login = async (values) => {
    try {
      const { data } = await api.post('/user/login', values)
      token.value = data.result.token
      email.value = data.result.email
      avatar.value = data.result.avatar
      role.value = data.result.role
      return '登入成功'
    } catch (error) {
      console.log(error)
      return error?.response?.data?.message || '登入失敗，請稍後再試'
    }
  }

  const profile = async () => {
    if (!isLogin.value) return

    try {
      const { data } = await apiAuth.get('/user/profile')
      role.value = data.result.role
      avatar.value = data.result.avatar
      name.value = data.result.name
      userId.value = data.result.userId
      email.value = data.result.email
    } catch (error) {
      console.log(error)
      token.value = ''
      role.value = UserRole.USER
      avatar.value = ''
      name.value = ''
      userId.value = ''
      email.value = ''
    }
  }

  const logout = async () => {
    try {
      await apiAuth.delete('/user/delete')
    } catch (error) {
      console.log(error)
    }
    token.value = ''
    email.value = ''
    avatar.value = ''
    role.value = UserRole.NONE
    userId.value = ''
    window.location.reload()
  }

  return {
    token,
    email,
    name,
    avatar,
    role,
    userId,
    isLogin,
    isAdmin,
    login,
    logout,
    profile
  }
}, {
  persist: {
    key: 'minutes',
    paths: ['token']
  }
})
