<template>
  <v-app>
    <v-navigation-drawer>
      <v-list>
        <v-card
        
        >
          <v-card-text class="text-center">
            <router-link to="/" >
              <v-img src="/src/assets/永信旅遊LOGO.png" width="150"></v-img>
            </router-link>
          </v-card-text>
        </v-card>
        
        <v-list-item
        v-for="navItem in navItems"
        :key= "navItem.to"
        :to = "navItem.to"
        :prepend-icon="navItem.icon"
        >
        {{ navItem.text }}
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    
    <v-main>
      <router-view />
    </v-main>

  </v-app>
</template>

<script setup>
  const navItems = [
    { to: 'minutes', text: '會議記錄', icon: 'mdi-note-edit-outline'},
    { to: 'admin/user', text: '使用者', icon: 'mdi-account'},
    { to: 'login', text: '登入', icon: 'mdi-account'},
  ]
</script>
