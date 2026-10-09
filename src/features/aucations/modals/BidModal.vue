<template>
  <div
    v-if="show && aucation"
    data-testid="bid-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden" @click.stop>
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Gavel :size="18" :stroke-width="2.5" />
          </div>
          <h2 class="text-base font-bold text-slate-800">Ajukan Penawaran</h2>
        </div>
        <button
          type="button"
          data-testid="close-bid-modal-btn"
          aria-label="Tutup"
          @click="onClose"
          class="p-1.5 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <X :size="18" />
        </button>
      </div>

      <form @submit.prevent="handleSave" class="p-6 space-y-4">
        <div class="rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm space-y-1">
          <p class="font-semibold text-slate-800" data-testid="bid-aucation-title">{{ aucation.title }}</p>
          <p class="text-slate-600">
            Harga awal:
            <span data-testid="bid-start-price" class="font-semibold">{{ formatRupiah(aucation.start_bid) }}</span>
          </p>
          <p class="text-slate-600">
            Tawaran tertinggi:
            <span data-testid="bid-highest-price" class="font-semibold">
              {{ highestBid === null ? "Belum ada tawaran" : formatRupiah(highestBid) }}
            </span>
          </p>
        </div>

        <div>
          <label for="bid-amount" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Nominal Penawaran (Rp) <span class="text-red-500">*</span>
          </label>
          <input
            id="bid-amount"
            type="number"
            min="0"
            data-testid="bid-input"
            v-model="bid"
            placeholder="Masukkan nominal"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm"
            required
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-bid-modal-btn"
            @click="onClose"
            :disabled="loading"
            class="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-bid-modal-btn"
            :disabled="loading"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/25 transition-all disabled:opacity-60"
          >
            <template v-if="loading">
              <Loader2 :size="18" class="animate-spin" />
              <span>Mengirim...</span>
            </template>
            <template v-else>
              <Gavel :size="18" :stroke-width="2.5" />
              <span>Ajukan Penawaran</span>
            </template>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { Gavel, X, Loader2 } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { formatRupiah, getHighestBid, showErrorDialog } from "../../../helpers/toolsHelper";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  aucation: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["close"]);

const aucationsStore = useAucationsStore();

const loading = ref(false);
const bid = ref("");

const highestBid = computed(() => getHighestBid(props.aucation?.bids));

function onClose() {
  emit("close");
}

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }
);

watch(
  () => [aucationsStore.isBidAdd, aucationsStore.isBidAdded],
  ([isBidAdd, isBidAdded]) => {
    if (isBidAdd) {
      loading.value = false;
      aucationsStore.setIsBidAdd(false);
      if (isBidAdded) {
        aucationsStore.setIsBidAdded(false);
        aucationsStore.asyncSetAucation(props.aucation.id);
        bid.value = "";
        onClose();
      }
    }
  }
);

function handleSave() {
  const amount = Number(bid.value);

  if (bid.value === "" || Number.isNaN(amount) || amount <= 0) {
    showErrorDialog("Nominal penawaran tidak valid");
    return;
  }

  if (highestBid.value !== null && amount <= highestBid.value) {
    showErrorDialog(
      `Penawaran harus lebih tinggi dari penawaran tertinggi saat ini (${formatRupiah(highestBid.value)})`
    );
    return;
  }

  if (highestBid.value === null && amount < Number(props.aucation.start_bid)) {
    showErrorDialog(
      `Penawaran tidak boleh lebih rendah dari harga awal (${formatRupiah(props.aucation.start_bid)})`
    );
    return;
  }

  loading.value = true;
  aucationsStore.asyncSetIsBidAdd(props.aucation.id, amount);
}
</script>
