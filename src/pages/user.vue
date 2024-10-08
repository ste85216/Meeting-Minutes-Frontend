<template>
  <v-container max-width="1400">
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <v-btn @click="openDialog(null)">
              新增使用者
            </v-btn>
            <v-btn
              class="ms-4"
              @click="openDepartmentDialog"
            >
              部門管理
            </v-btn>
          </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="tableSearch"
              label="搜尋"
              append-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              max-width="240"
              @keydown.enter="tableLoadItems(true)"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-data-table-server
          v-model:items-per-page="tableItemsPerPage"
          v-model:sort-by="tableSortBy"
          v-model:page="tablePage"
          :items-per-page-options="[10, 20 ,50]"
          :items="tableItems"
          :headers="tableHeaders"
          :loading="tableLoading"
          :items-length="tableItemsLength"
          :search="tableSearch"
          hover
          @update:items-per-page="tableLoadItems(false)"
          @update:sort-by="tableLoadItems(false)"
          @update:page="tableLoadItems(false)"
        >
          <template #[`item.role`]="{ item }">
            {{ item.role === 1 ? '管理者' : '使用者' }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-btn
              class="edit-btn"
              icon="mdi-pencil"
              variant="plain"
              @click="openDialog(item)"
            />
          </template>
        </v-data-table-server>
      </v-col>
    </v-row>
  </v-container>

  <!-- 新增或編輯dialog -->
  <v-dialog
    v-model="dialog.open"
    persistent
    width="360"
  >
    <v-form
      :disabled="isSubmitting"
      @submit.prevent="submit"
    >
      <v-card class="rounded-xl pa-4 pt-6">
        <v-card-title style="font-size: 18px;">
          {{ dialog.id ? '使用者資料編輯' : '新增使用者' }}
        </v-card-title>
        <v-card-text class="mt-3 pa-3">
          <!-- 表單字段 -->
          <v-text-field
            v-model="email.value.value"
            :error-messages="email.errorMessage.value"
            class="mt-2"
            label="email"
            type="email"
            variant="outlined"
            density="compact"
            min-length="4"
            maxlength="20"
            clearable
          />
          <v-text-field
            v-model="name.value.value"
            :error-messages="name.errorMessage.value"
            class="mt-2"
            label="姓名"
            type="text"
            variant="outlined"
            density="compact"
            min-length="4"
            maxlength="20"
            clearable
          />
          <v-select
            v-model="role.value.value"
            :error-messages="role.errorMessage.value"
            :items="roles"
            item-title="title"
            item-value="value"
            class="mt-2"
            label="權限"
            variant="outlined"
            density="compact"
            clearable
          />
          <v-text-field
            v-if="!dialog.id"
            v-model="password.value.value"
            :error-messages="password.errorMessage.value"
            class="mt-2"
            label="密碼"
            variant="outlined"
            density="compact"
            min-length="4"
            maxlength="20"
            clearable
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
          />
          <v-text-field
            v-if="!dialog.id"
            v-model="passwordConfirm.value.value"
            :error-messages="passwordConfirm.errorMessage.value"
            class="mt-2"
            label="確認密碼"
            :type="showPasswordConfirm ? 'text' : 'password'"
            :append-inner-icon="showPasswordConfirm ? 'mdi-eye-off' : 'mdi-eye'"
            variant="outlined"
            density="compact"
            min-length="4"
            maxlength="20"
            clearable
            @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="red"
            :loading="isSubmitting"
            @click="closeDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="green"
            type="submit"
            :loading="isSubmitting"
          >
            送出
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>

  <!-- 部門管理對話框 -->
  <v-dialog
    v-model="departmentDialog.open"
    persistent
    width="400"
  >
    <v-card>
      <v-card-title>部門管理</v-card-title>

      <v-card-text>
        <!-- 顯示現有部門列表 -->
        <v-list>
          <v-list-item
            v-for="(department, index) in departments"
            :key="index"
          >
            <v-list-item-title>{{ department.name }}</v-list-item-title>
            <v-list-item-action>
              <v-btn
                icon
                size="20"
                @click="deleteDepartment(department._id)"
              >
                <v-icon
                  size="16"
                  color="red"
                >
                  mdi-delete
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <!-- 新增部門輸入框 -->
        <v-text-field
          v-model="newDepartmentName"
          label="新增部門名稱"
          dense
          clearable
        />
      </v-card-text>

      <v-card-actions>
        <v-btn
          color="green"
          @click="addDepartment"
        >
          新增部門
        </v-btn>
        <v-btn
          color="red"
          @click="closeDepartmentDialog"
        >
          取消
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import * as yup from 'yup'
import { definePage } from 'vue-router/auto'
import { useForm, useField } from 'vee-validate'
import { useApi } from '@/composables/axios'
import { useSnackbar } from 'vuetify-use-dialog'

definePage({
  meta: {
    title: '使用者 | ystravel',
    login: true,
    admin: true
  }
})

const { api, apiAuth } = useApi()
const createSnackbar = useSnackbar()

const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const isEditing = ref(false)

const roles = ref([
  { title: '管理者', value: 1 },
  { title: '使用者', value: 0 }
])

const dialog = ref({
  open: false,
  id: ''
})

const departmentDialog = ref({ open: false })
const departments = ref([])
const newDepartmentName = ref('')

const openDialog = (item) => {
  if (item) {
    isEditing.value = true
    dialog.value.id = item._id
    email.value.value = item.email
    name.value.value = item.name
    role.value.value = item.role
  } else {
    isEditing.value = false
    dialog.value.id = ''
    resetForm()
  }
  dialog.value.open = true
}

const closeDialog = () => {
  dialog.value.open = false
  resetForm()
}

// 打開部門管理對話框
const openDepartmentDialog = async () => {
  departmentDialog.value.open = true
  // 加載部門列表
  const { data } = await apiAuth.get('/department/all')
  departments.value = data.result
}

// 關閉對話框
const closeDepartmentDialog = () => {
  departmentDialog.value.open = false
  newDepartmentName.value = ''
}

// 新增部門
const addDepartment = async () => {
  if (!newDepartmentName.value) return
  await apiAuth.post('/department', { name: newDepartmentName.value })
  createSnackbar({
    text: '部門新增成功',
    snackbarProps: {
      color: 'teal-darken-1'
    }
  })
  await openDepartmentDialog() // 重新加載部門列表
}

// 刪除部門
const deleteDepartment = async (id) => {
  await apiAuth.delete(`/department/${id}`)
  createSnackbar({
    text: '部門刪除成功',
    snackbarProps: {
      color: 'teal-darken-1'
    }
  })
  await openDepartmentDialog() // 重新加載部門列表
}

const schema = yup.object({
  email: yup
    .string()
    .required('請輸入email')
    .email('請輸入正確的 email 格式'),
  name: yup
    .string()
    .required('請輸入姓名'),
  role: yup
    .number()
    .required('請選擇使用者身分別'),
  password: yup
    .string()
    .when('$isEditing', {
      is: false,
      then: () => yup.string().required('請輸入密碼').min(8, '密碼至少需輸入8個字'),
      otherwise: () => yup.string().notRequired()
    }),
  passwordConfirm: yup
    .string()
    .when('password', {
      is: (password) => password && password.length > 0, // 當密碼有輸入時才要求確認密碼
      then: () => yup.string().required('請再次輸入密碼').oneOf([yup.ref('password')], '密碼不一致'),
      otherwise: () => yup.string().notRequired() // 如果沒有輸入密碼，允許不輸入確認密碼
    })
})

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    email: '',
    name: '',
    role: 0,
    password: '',
    passwordConfirm: ''
  }
})

const email = useField('email')
const name = useField('name')
const role = useField('role')
const password = useField('password')
const passwordConfirm = useField('passwordConfirm')

const submit = handleSubmit(async (values) => {
  try {
    if (isEditing.value) {
      await apiAuth.patch(`/user/${dialog.value.id}`, {
        email: values.email,
        name: values.name,
        role: values.role
      })
      createSnackbar({
        text: '使用者更新成功',
        snackbarProps: {
          color: 'teal-darken-1'
        }
      })
    } else {
      // 新增模式，發送 POST 請求
      await api.post('/user', {
        email: values.email,
        name: values.name,
        role: values.role,
        password: values.password
      })
      createSnackbar({
        text: '使用者新增成功',
        snackbarProps: {
          color: 'teal-darken-1'
        }
      })
    }
    closeDialog() // 關閉 dialog
    tableLoadItems(true)
  } catch (error) {
    console.log(error)
    createSnackbar({
      text: error?.response?.data?.message || '發生錯誤',
      snackbarProps: {
        color: 'red-lighten-1'
      }
    })
  }
})

// 數據表格相關變量
const tableItemsPerPage = ref(10)
const tableSortBy = ref([
  { key: 'userId', order: 'asc' }
])
const tablePage = ref(1)
const tableItems = ref([])
const tableHeaders = [
  { title: '使用者編號', align: 'left', sortable: true, key: 'userId' },
  { title: 'email', align: 'left', sortable: true, key: 'email' },
  { title: '姓名', align: 'left', sortable: true, key: 'name' },
  { title: '權限', align: 'left', sortable: true, key: 'role' },
  { title: '操作', align: 'left', sortable: false, key: 'action' }
]
const tableLoading = ref(true)
const tableItemsLength = ref(0)
const tableSearch = ref('')

// 加載表格數據
const tableLoadItems = async (reset) => {
  if (reset) tablePage.value = 1
  tableLoading.value = true
  try {
    const { data } = await apiAuth.get('/user/all', {
      params: {
        page: tablePage.value,
        itemsPerPage: tableItemsPerPage.value,
        sortBy: tableSortBy.value[0]?.key || 'userId',
        sortOrder: tableSortBy.value[0]?.order || 'asc',
        search: tableSearch.value
      }
    })
    tableItems.value.splice(0, tableItems.value.length, ...data.result.data)
    tableItemsLength.value = data.result.totalItems // 使用 totalItems 作為總數
  } catch (error) {
    console.log(error)
    createSnackbar({
      text: error?.response?.data?.message || '發生錯誤',
      snackbarProps: {
        color: 'red-lighten-1'
      }
    })
  }
  tableLoading.value = false
}

// 初始加載表格數據
tableLoadItems()
</script>

<style lang="scss" scoped>
</style>
