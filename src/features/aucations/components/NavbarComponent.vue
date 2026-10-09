<template>
  <header class="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
    <div class="w-full flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3">
        <button
          type="button"
          data-testid="toggle-sidebar-btn"
          @click="$emit('toggle-sidebar')"
          class="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Toggle Navigation"
        >
          <X v-if="isSidebarOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>

        <RouterLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <CheckSquare :size="22" :stroke-width="2.5" />
          </div>
          <div>
            <span class="text-lg font-bold bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
              Delcom Auction
            </span>
          </div>
        </RouterLink>
      </div>

      <!-- Profile User Dropdown -->
      <div class="relative" ref="dropdownRef">
        <button
          type="button"
          data-testid="profile-dropdown-button"
          @click="dropdownOpen = !dropdownOpen"
          class="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <img
            v-if="profile?.photo"
            :src="profile.photo"
            :alt="profile.name"
            class="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div
            v-else
            class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs"
          >
            {{ profile?.name ? profile.name.charAt(0).toUpperCase() : "U" }}
          </div>

          <div class="hidden sm:flex flex-col text-left">
            <span class="text-sm font-semibold text-slate-800 leading-tight">
              {{ profile?.name || "Pengguna" }}
            </span>
            <span class="text-xs text-slate-500 leading-tight">
              {{ profile?.email || "" }}
            </span>
          </div>
          <ChevronDown
            :size="16"
            class="text-slate-600 transition-transform duration-200"
            :class="{ 'rotate-180': dropdownOpen }"
          />
        </button>

        <div
          v-if="dropdownOpen"
          data-testid="profile-dropdown-menu"
          class="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-900/5 divide-y divide-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div class="px-3 py-2 sm:hidden">
            <p class="text-sm font-semibold text-slate-800">{{ profile?.name }}</p>
            <p class="text-xs text-slate-500 truncate">{{ profile?.email }}</p>
          </div>

          <div class="py-1">
            <button
              type="button"
              data-testid="dropdown-profile-link"
              @click="handleProfileClick"
              class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <User :size="18" class="text-slate-500" />
              Profil Saya
            </button>
          </div>

          <div class="pt-1">
            <button
              type="button"
              data-testid="dropdown-logout-button"
              @click="handleLogoutClick"
              class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left"
            >
              <LogOut :size="18" class="text-red-500" />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { CheckSquare, User, LogOut, ChevronDown, Menu, X } from "lucide-vue-next";

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle-sidebar", "logout"]);

const router = useRouter();
const dropdownOpen = ref(false);
const dropdownRef = ref(null);

function handleClickOutside(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

function handleProfileClick() {
  dropdownOpen.value = false;
  router.push("/profile");
}

function handleLogoutClick() {
  dropdownOpen.value = false;
  emit("logout");
}
</script>
