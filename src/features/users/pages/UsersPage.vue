<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Semua Pengguna
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Daftar seluruh akun pengguna yang terdaftar di dalam sistem.
        </p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <!-- Header Search -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Search
            :size="18"
            class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
          />
          <input
            type="text"
            data-testid="search-user-input"
            v-model="search"
            placeholder="Cari pengguna berdasarkan nama atau email..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
        </div>
        <span class="text-xs font-semibold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
          Total: {{ filteredUsers.length }} Pengguna
        </span>
      </div>

      <!-- User Grid -->
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-if="loadingUsers && filteredUsers.length === 0" class="col-span-full py-16 text-center text-slate-600">
          <Loader2 :size="36" class="mx-auto text-indigo-600 animate-spin mb-2" />
          <p class="font-medium text-slate-600">Memuat daftar pengguna...</p>
        </div>
        <div v-else-if="filteredUsers.length === 0" class="col-span-full py-12 text-center text-slate-600">
          <Users :size="40" class="mx-auto text-slate-300 mb-2" />
          <p class="font-medium">Tidak ada data pengguna ditemukan.</p>
        </div>
        <div
          v-else
          v-for="u in filteredUsers"
          :key="`user-${u.id}`"
          :data-testid="`user-card-${u.id}`"
          class="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all bg-white flex flex-col justify-between"
        >
          <div class="flex items-start gap-3.5">
            <img
              v-if="u.photo"
              :src="u.photo"
              :alt="u.name"
              class="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div
              v-else
              class="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shrink-0"
            >
              {{ u.name ? u.name.charAt(0).toUpperCase() : "U" }}
            </div>

            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-slate-900 truncate">{{ u.name }}</h3>
              <p class="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                <Mail :size="14" class="shrink-0 text-slate-600" />
                <span class="truncate">{{ u.email }}</span>
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span class="font-mono font-semibold">ID: #{{ u.id }}</span>
            <span class="flex items-center gap-1">
              <Calendar :size="13" />
              {{ formatDate(u.created_at) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useUsersStore } from "../states/usersStore";
import { formatDate } from "../../../helpers/toolsHelper";
import { Users, Search, Mail, Calendar, Loader2 } from "lucide-vue-next";

const usersStore = useUsersStore();

const users = computed(() => usersStore.users || []);
const loadingUsers = ref(false);
const search = ref("");

onMounted(() => {
  loadingUsers.value = true;
  Promise.resolve(usersStore.asyncSetUsers()).finally(() => {
    loadingUsers.value = false;
  });
});

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    if (!search.value.trim()) return true;
    const q = search.value.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });
});
</script>
