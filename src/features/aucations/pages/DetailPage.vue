<template>
  <div v-if="!profile || !aucation" class="flex flex-col items-center justify-center py-20">
    <h1 class="sr-only">Memuat detail lelang...</h1>
    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>

  <div v-else class="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
    <!-- Back & owner actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <RouterLink
        to="/"
        data-testid="back-to-aucations-link"
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft :size="18" />
        Kembali ke Lelang
      </RouterLink>

      <div v-if="isOwner" class="flex items-center gap-2">
        <button
          type="button"
          data-testid="edit-cover-btn"
          @click="showCoverModal = true"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
        >
          <ImagePlus :size="16" />
          Ubah Cover
        </button>
        <button
          type="button"
          data-testid="edit-detail-btn"
          @click="showEditModal = true"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
        >
          <Edit3 :size="16" />
          Ubah Data
        </button>
        <button
          type="button"
          data-testid="delete-detail-btn"
          @click="handleDelete"
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
        >
          <Trash2 :size="16" />
          Hapus
        </button>
      </div>
    </div>

    <article class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <img
        v-if="aucation.cover"
        :src="aucation.cover"
        :alt="aucation.title"
        data-testid="aucation-cover-image"
        class="w-full max-h-[28rem] object-contain bg-slate-100"
      />
      <div
        v-else
        data-testid="aucation-cover-placeholder"
        class="w-full h-56 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600"
      >
        <ImageOff :size="48" />
      </div>

      <div class="p-6 sm:p-8 space-y-6">
        <div class="flex flex-wrap items-center gap-2">
          <span
            data-testid="detail-status-badge"
            class="inline-flex px-3 py-1 rounded-full text-xs font-bold border"
            :class="
              closed
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
            "
          >
            {{ closed ? "Lelang Ditutup" : "Lelang Berlangsung" }}
          </span>
          <span data-testid="detail-countdown" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Clock :size="14" />
            {{ formatCountdown(aucation.closed_at, now) }}
          </span>
        </div>

        <h1 data-testid="detail-title" class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {{ aucation.title }}
        </h1>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
          <span class="inline-flex items-center gap-2">
            <User :size="16" />
            <span data-testid="detail-author">{{ aucation.author?.name || "Pengguna" }}</span>
          </span>
          <span class="inline-flex items-center gap-2">
            <Calendar :size="16" />
            <span data-testid="detail-closed-at">Ditutup {{ formatDate(aucation.closed_at) }}</span>
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-600">Harga Awal</p>
            <p data-testid="detail-start-bid" class="text-xl font-black text-slate-900 mt-1">
              {{ formatRupiah(aucation.start_bid) }}
            </p>
          </div>
          <div class="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
            <p class="text-xs font-semibold uppercase tracking-wider text-emerald-800">Tawaran Tertinggi</p>
            <p data-testid="detail-highest-bid" class="text-xl font-black text-emerald-700 mt-1">
              {{ highestBid === null ? "Belum ada tawaran" : formatRupiah(highestBid) }}
            </p>
          </div>
        </div>

        <MarkdownViewer :content="aucation.description || ''" />

        <div v-if="!isOwner && !closed" class="pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="open-bid-btn"
            @click="showBidModal = true"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/25 transition-all"
          >
            <Gavel :size="18" />
            Ajukan Penawaran
          </button>
        </div>
      </div>
    </article>

    <!-- Bid history -->
    <section class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-4">
      <h2 class="text-lg font-bold text-slate-800">Riwayat Penawaran</h2>

      <div
        v-if="aucation.my_bid"
        data-testid="my-bid"
        class="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 flex items-center justify-between gap-3"
      >
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-indigo-700">Penawaran Anda</p>
          <p data-testid="my-bid-amount" class="text-lg font-black text-slate-900">
            {{ formatRupiah(aucation.my_bid.bid) }}
          </p>
        </div>
        <button
          v-if="!closed"
          type="button"
          data-testid="delete-bid-btn"
          @click="handleDeleteBid"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
        >
          <Trash2 :size="16" />
          Batalkan
        </button>
      </div>

      <p v-if="sortedBids.length === 0" data-testid="no-bids" class="text-sm text-slate-600 text-center py-4">
        Belum ada penawaran. Jadilah penawar pertama!
      </p>
      <ol v-else class="space-y-2">
        <li
          v-for="(item, index) in sortedBids"
          :key="`bid-${item.id}`"
          :data-testid="`bid-${item.id}`"
          class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
              {{ index + 1 }}
            </span>
            <span class="font-bold text-slate-900">{{ formatRupiah(item.bid) }}</span>
          </div>
          <span class="text-xs text-slate-600">{{ formatDate(item.created_at) }}</span>
        </li>
      </ol>
    </section>

    <ChangeCoverModal :show="showCoverModal" :aucation="aucation" @close="showCoverModal = false" />
    <ChangeModal :show="showEditModal" :aucation="aucation" @close="showEditModal = false" />
    <BidModal :show="showBidModal" :aucation="aucation" @close="showBidModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import BidModal from "../modals/BidModal.vue";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import {
  formatCountdown,
  formatDate,
  formatRupiah,
  getHighestBid,
  isAucationClosed,
  showConfirmDialog,
} from "../../../helpers/toolsHelper";
import {
  ArrowLeft,
  ImagePlus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  Gavel,
  User,
  ImageOff,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const aucationId = computed(() => route.params.aucationId);
const profile = computed(() => usersStore.profile);
const aucation = computed(() => aucationsStore.aucation);

const showCoverModal = ref(false);
const showEditModal = ref(false);
const showBidModal = ref(false);
const now = ref(Date.now());

const timer = setInterval(() => {
  now.value = Date.now();
}, 30000);
onBeforeUnmount(() => clearInterval(timer));

const isOwner = computed(() => aucation.value?.user_id === profile.value?.id);
const closed = computed(() => isAucationClosed(aucation.value?.closed_at, now.value));
const highestBid = computed(() => getHighestBid(aucation.value?.bids));
const sortedBids = computed(() =>
  [...(aucation.value?.bids || [])].sort((a, b) => Number(b.bid) - Number(a.bid))
);

onMounted(() => {
  aucationsStore.asyncSetAucation(aucationId.value);
});

watch(aucationId, (newId) => {
  aucationsStore.asyncSetAucation(newId);
});

watch(
  () => [aucationsStore.isAucation, aucationsStore.aucation],
  ([isAucation, current]) => {
    if (isAucation) {
      aucationsStore.setIsAucation(false);
      if (!current) {
        router.push("/");
      }
    }
  }
);

watch(
  () => [aucationsStore.isAucationDelete, aucationsStore.isAucationDeleted],
  ([isDelete, isDeleted]) => {
    if (isDelete) {
      aucationsStore.setIsAucationDelete(false);
      if (isDeleted) {
        aucationsStore.setIsAucationDeleted(false);
        router.push("/");
      }
    }
  }
);

watch(
  () => [aucationsStore.isBidDelete, aucationsStore.isBidDeleted],
  ([isBidDelete, isBidDeleted]) => {
    if (isBidDelete) {
      aucationsStore.setIsBidDelete(false);
      if (isBidDeleted) {
        aucationsStore.setIsBidDeleted(false);
        aucationsStore.asyncSetAucation(aucationId.value);
      }
    }
  }
);

async function handleDelete() {
  const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus lelang ini?");
  if (result.isConfirmed) {
    aucationsStore.asyncSetIsAucationDelete(aucation.value.id);
  }
}

async function handleDeleteBid() {
  const result = await showConfirmDialog("Apakah Anda yakin ingin membatalkan penawaran Anda?");
  if (result.isConfirmed) {
    aucationsStore.asyncSetIsBidDelete(aucation.value.id);
  }
}
</script>
