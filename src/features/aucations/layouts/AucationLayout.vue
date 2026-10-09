<template>
  <main v-if="!usersStore.profile" class="min-h-screen flex items-center justify-center bg-slate-50">
    <div class="flex flex-col items-center gap-3">
      <div class="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <h1 class="text-sm font-medium text-slate-600">Memuat sesi pengguna...</h1>
    </div>
  </main>

  <div v-else class="min-h-screen bg-slate-50 text-slate-800">
    <NavbarComponent
      :profile="usersStore.profile"
      :is-sidebar-open="isSidebarOpen"
      @logout="handleLogout"
      @toggle-sidebar="isSidebarOpen = !isSidebarOpen"
    />

    <SidebarComponent
      :is-sidebar-open="isSidebarOpen"
      @close-mobile="isSidebarOpen = false"
    />

    <main class="pt-16 md:pl-64 transition-all">
      <div class="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, RouterView } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useUsersStore } from "../../users/states/usersStore";
import { useAuthStore } from "../../auth/states/authStore";
import apiHelper from "../../../helpers/apiHelper";

const router = useRouter();
const usersStore = useUsersStore();
const authStore = useAuthStore();

const isSidebarOpen = ref(false);

// 1. Jalankan sekali untuk mengecek apakah pengguna sudah login
onMounted(() => {
  const authToken = apiHelper.getAccessToken();
  if (authToken) {
    usersStore.asyncSetProfile();
  } else {
    router.push("/auth/login");
  }
});

// 2. Jika proses pengambilan profil selesai dan tidak ada profile, arahkan ke login
watch(
  () => [usersStore.isProfile, usersStore.profile],
  ([isProfile, profile]) => {
    if (isProfile) {
      usersStore.setIsProfile(false);
      if (!profile) {
        apiHelper.putAccessToken("");
        router.push("/auth/login");
      }
    }
  }
);

// 3. Efek setelah logout
watch(
  () => authStore.isAuthLogout,
  (isAuthLogout) => {
    if (isAuthLogout) {
      authStore.setIsAuthLogout(false);
      router.push("/auth/login");
    }
  }
);

function handleLogout() {
  authStore.asyncSetIsAuthLogout();
}
</script>
