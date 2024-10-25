<template>
  <div
    v-if="!isChecking"
    id="background"
    class="d-flex justify-center align-center"
  >
    <v-container
      width="340"
      height="400"
      class="login-wrapper"
    >
      <v-form
        :disabled="isSubmitting"
        @submit.prevent="submit"
      >
        <v-row class="px-4">
          <v-col class="text-center mt-4">
            登入
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="email.value.value"
              :error-messages="email.errorMessage.value"
              label="email"
              density="compact"
              variant="underlined"
              clearable
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="password.value.value"
              :error-messages="password.errorMessage.value"
              :type="showPassword? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              label="password"
              density="compact"
              variant="underlined"
              @click:append-inner="showPassword = !showPassword"
            />
          </v-col>
          <v-col
            cols="12"
            class="text-center"
          >
            <v-btn
              block
              elevation="2"
              color="orange-darken-1"
              type="submit"
              :loading="isSubmitting"
            >
              Login
            </v-btn>
          </v-col>
          <v-divider class="my-4" />
          <v-col
            cols="12"
            class="text-center"
          >
            <v-btn
              block
              elevation="2"
              color="red darken-1"
              @click="googleLogin"
            >
              <v-icon
                icon="mdi-google-plus"
                size="24"
                class="me-2"
              />使用Google 登入
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
    <v-progress-circular
      v-if="isChecking"
      indeterminate
      size="64"
      color="primary"
      class="center-screen"
    />
  </div>
</template>

<script setup>
import { definePage } from 'vue-router/auto'
import validator from 'validator'
import { ref, onMounted, nextTick } from 'vue'
import * as yup from 'yup'
import { useUserStore } from '@/stores/user'
import { useSnackbar } from 'vuetify-use-dialog'
import { useDisplay } from 'vuetify'
import { useForm, useField } from 'vee-validate'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    title: '登入 | ystravel' // 這裡的 title 會被設定到 <title> 標籤
  }
})

const router = useRouter()
const user = useUserStore()
const createSnackbar = useSnackbar()
// 新增 isChecking 狀態來控制頁面顯示
const isChecking = ref(true)

const showPassword = ref(false)

const schema = yup.object({
  email: yup
    .string()
    .required('請輸入email')
    .email('請輸入正確email格式'),
  password: yup
    .string()
    .required('請輸入密碼')
})

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: schema
})

const email = useField('email')
const password = useField('password')
// 綁定到 Google 登入方法
const googleLogin = user.googleLogin

const submit = handleSubmit(async (values) => {
  const result = await user.login(values)
  if (result === '登入成功') {
    createSnackbar({
      text: result,
      snackbarProps: {
        color: 'teal-darken-1'
      }
    })
    router.push('/minutes')
  } else {
    createSnackbar({
      text: result,
      snackbarProps: {
        color: 'red-lighten-1'
      }
    })
  }
})

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const email = params.get('email')
  const avatar = params.get('avatar')
  const name = params.get('name')
  const role = parseInt(params.get('role'), 10)
  const errorMessage = params.get('message') // 抓取錯誤訊息

  // 如果有錯誤訊息，顯示錯誤 Snackbar 並保持在登入頁面
  if (errorMessage) {
    createSnackbar({
      text: errorMessage,
      snackbarProps: {
        color: 'red-lighten-1'
      }
    })
    isChecking.value = false
    return
  }

  if (token) {
    user.$patch({
      token,
      email,
      avatar,
      name,
      role
    })

    await nextTick()

    createSnackbar({
      text: '登入成功',
      snackbarProps: {
        color: 'teal-darken-1'
      }
    })

    router.push('/minutes')
  }

  // 完成檢查後顯示頁面
  isChecking.value = false
})
</script>

<style lang="scss" scoped>
#background {
  width: 100%;
  height: 100%;
  background-image: url(/src/assets/image/aurora_bg.jpg);
  background-size: cover;
}

.login-wrapper {
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-family: "微軟正黑體";
  font-size: 20px;
  font-weight: 600;
}

</style>
