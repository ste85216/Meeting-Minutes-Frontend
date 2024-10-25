<template>
  <v-container>
    <!-- 標題 -->
    <v-row>
      <v-col>
        <h2 class="mb-4">
          會議室預約系統
        </h2>
        <!-- 預約按鈕 -->
        <v-btn @click="openBookingDialog">
          我要預約
        </v-btn>
        <!-- 管理員按鈕 -->
        <v-btn
          v-if="user.isAdmin"
          class="ms-4"
          @click="openRoomManagementDialog"
        >
          會議室管理
        </v-btn>
      </v-col>
    </v-row>

    <!-- 月曆顯示 -->
    <v-row>
      <v-col>
        <v-calendar />
        <!-- <v-calendar
          v-model="selectedDate"
          :events="events"
          color="teal"
          event-color="green"
          first-interval="8"
          interval-count="8"
          :interval-height="40"
          interval-minutes="60"
          locale="zh-TW"
          type="week"
        /> -->
      </v-col>
    </v-row>

    <!-- 預約對話框 -->
    <v-dialog
      v-model="bookingDialog.open"
      persistent
      width="500"
    >
      <v-card>
        <v-card-title>
          <span class="text-h6">預約會議室</span>
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="submitBooking">
            <!-- 使用者姓名 -->
            <v-autocomplete
              v-model="bookingForm.user"
              :items="userOptions"
              label="姓名"
              item-value="userId"
              item-text="name"
              clearable
              @input="fetchUser"
            />

            <!-- 部門 -->
            <v-select
              v-model="bookingForm.department"
              :items="departments"
              item-value="_id"
              item-text="name"
              label="部門"
              clearable
            />

            <!-- 會議室選擇 -->
            <v-select
              v-model="bookingForm.room"
              :items="rooms"
              item-value="roomId"
              item-text="roomName"
              label="選擇會議室"
              clearable
              @change="fetchAvailableTimes"
            />

            <!-- 可選擇日期 -->
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="auto"
            >
              <template #activator="{ on, attrs }">
                <v-text-field
                  v-model="bookingForm.date"
                  label="可預約日期"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="bookingForm.date"
                @change="dateMenu = false"
              />
            </v-menu>

            <!-- 可選擇時間 -->
            <v-select
              v-model="bookingForm.time"
              :items="availableTimes"
              label="可預約時間"
              clearable
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="red"
            text
            @click="closeBookingDialog"
          >
            取消
          </v-btn>
          <v-btn
            color="green"
            text
            @click="submitBooking"
          >
            確定
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 會議室管理對話框 -->
    <v-dialog
      v-model="roomManagementDialog.open"
      persistent
      width="600"
    >
      <v-card>
        <v-card-title>
          <span class="text-h6">會議室管理</span>
        </v-card-title>

        <v-card-text>
          <!-- 列出所有會議室 -->
          <v-list>
            <v-list-item
              v-for="room in rooms"
              :key="room.roomId"
              @click="editRoom(room)"
            >
              <v-list-item-title>{{ room.roomName }}</v-list-item-title>
              <v-list-item-subtitle>{{ room.capacity }} 人 - {{ room.location }}</v-list-item-subtitle>
              <v-list-item-action>
                <v-btn
                  icon
                  @click.stop="deleteRoom(room.roomId)"
                >
                  <v-icon color="red">
                    mdi-delete
                  </v-icon>
                </v-btn>
                <v-btn
                  icon
                  @click.stop="openEditRoomDialog(room)"
                >
                  <v-icon color="blue">
                    mdi-pencil
                  </v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="green"
            text
            @click="openNewRoomDialog"
          >
            新增會議室
          </v-btn>
          <v-spacer />
          <v-btn
            color="red"
            text
            @click="closeRoomManagementDialog"
          >
            關閉
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { definePage } from 'vue-router/auto'
import { useUserStore } from '@/stores/user'

// 定義頁面元數據
definePage({
  meta: {
    title: '會議室 | ystravel',
    login: true,
    admin: false
  }
})

const user = useUserStore()
const selectedDate = ref(new Date())
const bookingDialog = ref({ open: false })
const roomManagementDialog = ref({ open: false })
const dateMenu = ref(false)

// 假資料，用於預約的會議室、部門等
const rooms = ref([])
const departments = ref([])
const userOptions = ref([])
const events = ref([])
const availableTimes = ref([])

// 預約表單
const bookingForm = ref({
  user: null,
  department: null,
  room: null,
  date: null,
  time: null
})

// 打開預約對話框
const openBookingDialog = () => {
  bookingDialog.value.open = true
}

// 關閉預約對話框
const closeBookingDialog = () => {
  bookingDialog.value.open = false
  resetBookingForm()
}

// 提交預約
const submitBooking = () => {
  console.log('提交預約：', bookingForm.value)
  // TODO: 發送請求到後端
  closeBookingDialog()
}

// 重置預約表單
const resetBookingForm = () => {
  bookingForm.value = {
    user: null,
    department: null,
    room: null,
    date: null,
    time: null
  }
}

// 開啟會議室管理對話框
const openRoomManagementDialog = () => {
  roomManagementDialog.value.open = true
}

// 關閉會議室管理對話框
const closeRoomManagementDialog = () => {
  roomManagementDialog.value.open = false
}

// 模擬載入資料
onMounted(() => {
  // 假設這些資料從後端 API 來
  rooms.value = [
    { roomId: 'room-001', roomName: 'A會議室', capacity: 10, location: '1樓' },
    { roomId: 'room-002', roomName: 'B會議室', capacity: 20, location: '2樓' }
  ]
  departments.value = [
    { _id: 'dep-001', name: '技術部' },
    { _id: 'dep-002', name: '行銷部' }
  ]
  userOptions.value = [
    { userId: '001', name: '小明' },
    { userId: '002', name: '小紅' }
  ]
  events.value = [
    {
      name: 'A會議室',
      start: '2024-10-09 13:00',
      end: '2024-10-09 16:00',
      color: 'blue'
    }
  ]
})

// 模擬查詢使用者
const fetchUser = (query) => {
  console.log('查詢使用者：', query)
}

// 查詢會議室的可用時間
const fetchAvailableTimes = () => {
  availableTimes.value = ['13:00 - 14:00', '15:00 - 16:00']
}

// 編輯會議室
const openEditRoomDialog = (room) => {
  console.log('編輯會議室：', room)
}

// 刪除會議室
const deleteRoom = (roomId) => {
  console.log('刪除會議室：', roomId)
}

// 新增會議室
const openNewRoomDialog = () => {
  console.log('新增會議室')
}
</script>
