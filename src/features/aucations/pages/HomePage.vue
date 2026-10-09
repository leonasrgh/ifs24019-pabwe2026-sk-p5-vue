<template>
  <div v-if="profile" class="space-y-6 animate-in fade-in duration-300">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ activeTab === "mine" ? "Lelang Saya" : "Dashboard Lelang" }}
        </h1>
        <p class="text-sm text-slate-600 mt-1">
          Ikuti lelang barang yang sedang berlangsung dan ajukan penawaran terbaik Anda.
        </p>
      </div>
      <button
        type="button"
        data-testid="add-aucation-btn"
        @click="showAddModal = true"
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
      >
        <Plus :size="18" :stroke-width="2.5" />
        <span>Tambah Lelang</span>
      </button>
    </div>

    <!-- Controls -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
      <div class="relative max-w-md">
        <Search :size="18" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          data-testid="search-aucation-input"
          aria-label="Cari lelang"
          v-model="searchQuery"
          placeholder="Cari judul atau deskripsi lelang..."
          class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
        />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :data-testid="`tab-${tab.id}-btn`"
            @click="activeTab = tab.id"
            class="px-3 py-1.5 rounded-lg transition-all"
            :class="activeTab === tab.id ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'"
          >
            {{ tab.label }}
          </button>
        </div>

        <button
          v-if="activeTab === 'mine'"
          type="button"
          data-testid="delete-all-aucations-btn"
          @click="handleDeleteAll"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
        >
          <Trash2 :size="16" />
          Hapus Semua
        </button>
      </div>
    </div>

    <!-- List -->
    <div
      v-if="loading && filteredAucations.length === 0"
      class="bg-white rounded-2xl border border-slate-200/80 px-6 py-16 text-center text-slate-600"
    >
      <Loader2 :size="36" class="mx-auto text-indigo-600 animate-spin mb-2" />
      <p class="font-medium">Memuat lelang...</p>
    </div>

    <div
      v-else-if="filteredAucations.length === 0"
      class="bg-white rounded-2xl border border-slate-200/80 px-6 py-16 text-center text-slate-600"
    >
      <Gavel :size="40" class="mx-auto text-slate-600 mb-2" />
      <p class="font-medium">Belum ada lelang yang cocok.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <RouterLink
        v-for="item in filteredAucations"
        :key="`aucation-${item.id}`"
        :to="`/aucations/${item.id}`"
        :data-testid="`aucation-card-${item.id}`"
        class="group bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col"
      >
        <img
          v-if="item.cover"
          :src="item.cover"
          :alt="item.title"
          class="w-full h-44 object-cover bg-slate-100"
        />
        <div
          v-else
          class="w-full h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600"
        >
          <ImageOff :size="40" />
        </div>

        <div class="p-5 flex flex-col flex-1 gap-3">
          <div class="flex items-start justify-between gap-2">
            <h2 class="font-bold text-slate-900 leading-snug line-clamp-2">{{ item.title }}</h2>
            <span
              :data-testid="`aucation-status-${item.id}`"
              class="shrink-0 inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border"
              :class="
                isClosed(item)
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              "
            >
              {{ isClosed(item) ? "Ditutup" : "Berlangsung" }}
            </span>
          </div>

          <p class="text-xs text-slate-600">
            oleh <span class="font-semibold">{{ item.author?.name || "Pengguna" }}</span>
          </p>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p class="text-slate-600">Harga awal</p>
              <p :data-testid="`aucation-start-${item.id}`" class="font-bold text-slate-900">
                {{ formatRupiah(item.start_bid) }}
              </p>
            </div>
            <div>
              <p class="text-slate-600">Tawaran tertinggi</p>
              <p :data-testid="`aucation-highest-${item.id}`" class="font-bold text-slate-900">
                {{ highestLabel(item) }}
              </p>
            </div>
          </div>

          <div class="mt-auto flex items-center gap-1.5 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <Clock :size="14" />
            <span :data-testid="`aucation-countdown-${item.id}`">{{ formatCountdown(item.closed_at, now) }}</span>
          </div>
        </div>
      </RouterLink>
    </div>

    <AddModal :show="showAddModal" @close="showAddModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { RouterLink, useRoute } from "vue-router";
import AddModal from "../modals/AddModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import {
  formatCountdown,
  formatRupiah,
  getHighestBid,
  isAucationClosed,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";
import { Plus, Search, Gavel, Clock, Trash2, Loader2, ImageOff } from "lucide-vue-next";

const route = useRoute();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const tabs = [
  { id: "all", label: "Semua Lelang" },
  { id: "mine", label: "Lelang Saya" },
  { id: "ongoing", label: "Lelang Berlangsung" },
  { id: "closed", label: "Lelang Ditutup" },
];

const profile = computed(() => usersStore.profile);
const aucations = computed(() => aucationsStore.aucations);

const loading = ref(false);
const searchQuery = ref("");
const showAddModal = ref(false);
const activeTab = ref(route.query.tab === "mine" ? "mine" : "all");
const now = ref(Date.now());

const timer = setInterval(() => {
  now.value = Date.now();
}, 30000);

let isMounted = true;
onBeforeUnmount(() => {
  isMounted = false;
  clearInterval(timer);
});

watch(
  () => route.query.tab,
  (tab) => {
    activeTab.value = tab === "mine" ? "mine" : "all";
  }
);

// "Lelang Saya" memakai filter is_me dari API; tab lain memuat semua lelang,
// lalu status berlangsung/ditutup ditentukan dari closed_at.
watch(
  () => activeTab.value === "mine",
  (isMe) => {
    loading.value = true;
    Promise.resolve(aucationsStore.asyncSetAucations({ isMe })).finally(() => {
      if (isMounted) loading.value = false;
    });
  },
  { immediate: true }
);

watch(
  () => [aucationsStore.isAucationDeleteAll, aucationsStore.isAucationDeletedAll],
  ([isDeleteAll, isDeletedAll]) => {
    if (isDeleteAll) {
      aucationsStore.setIsAucationDeleteAll(false);
      if (isDeletedAll) {
        aucationsStore.setIsAucationDeletedAll(false);
        aucationsStore.asyncReloadAucations();
      }
    }
  }
);

function isClosed(item) {
  return isAucationClosed(item.closed_at, now.value);
}

function highestLabel(item) {
  if (!item.bids || item.bids.length === 0) return "Belum ada tawaran";
  const highest = getHighestBid(item.bids);
  return highest === null ? `${item.bids.length} tawaran` : formatRupiah(highest);
}

const filteredAucations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return aucations.value.filter((item) => {
    if (activeTab.value === "ongoing" && isClosed(item)) return false;
    if (activeTab.value === "closed" && !isClosed(item)) return false;
    if (!query) return true;
    const title = item.title ? item.title.toLowerCase() : "";
    const description = item.description ? item.description.toLowerCase() : "";
    return title.includes(query) || description.includes(query);
  });
});

async function handleDeleteAll() {
  const result = await showConfirmDialog(
    "Apakah Anda yakin ingin menghapus SEMUA lelang milik Anda? Tindakan ini tidak dapat dibatalkan."
  );
  if (result.isConfirmed) {
    aucationsStore.asyncSetIsAucationDeleteAll();
  }
}
</script>
