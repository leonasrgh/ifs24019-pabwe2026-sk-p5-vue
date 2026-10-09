<template>
  <div
    v-if="show && aucation"
    data-testid="edit-aucation-modal"
    class="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200 overflow-hidden"
  >
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
          <Edit3 :size="18" :stroke-width="2.5" />
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-800">Ubah Data Lelang</h2>
          <p class="text-xs text-slate-600">Perbarui informasi barang lelang</p>
        </div>
      </div>
      <button
        type="button"
        data-testid="close-edit-modal-btn"
        aria-label="Tutup"
        @click="onClose"
        class="p-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
      >
        <X :size="20" />
      </button>
    </div>

    <form @submit.prevent="handleSave" class="flex-1 flex flex-col min-h-0 bg-white">
      <div class="flex-1 flex flex-col min-h-0 p-6 md:p-8 space-y-4 w-full overflow-y-auto">
        <div class="shrink-0">
          <label for="edit-aucation-title" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Judul Barang <span class="text-red-500">*</span>
          </label>
          <input
            id="edit-aucation-title"
            type="text"
            data-testid="edit-aucation-title-input"
            v-model="title"
            placeholder="Contoh: Oculus Quest 2"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
            required
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
          <div>
            <label for="edit-aucation-start-bid" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Harga Awal (Rp) <span class="text-red-500">*</span>
            </label>
            <input
              id="edit-aucation-start-bid"
              type="number"
              min="0"
              data-testid="edit-aucation-start-bid-input"
              v-model="startBid"
              placeholder="10000"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
              required
            />
          </div>
          <div>
            <label for="edit-aucation-closed-at" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Batas Waktu Penutupan <span class="text-red-500">*</span>
            </label>
            <input
              id="edit-aucation-closed-at"
              type="datetime-local"
              data-testid="edit-aucation-closed-at-input"
              v-model="closedAt"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
              required
            />
          </div>
        </div>

        <div class="flex-1 flex flex-col min-h-0">
          <p class="block text-sm font-semibold text-slate-700 mb-1.5 shrink-0">
            Deskripsi (Markdown) <span class="text-red-500">*</span>
          </p>
          <div class="flex-1 min-h-[300px]">
            <MarkdownEditor
              v-model="description"
              placeholder="Tuliskan kondisi, kelengkapan, dan spesifikasi barang..."
              height="100%"
              textarea-test-id="edit-aucation-description-input"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
        <button
          type="button"
          data-testid="cancel-edit-modal-btn"
          @click="onClose"
          :disabled="loading"
          class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          data-testid="submit-edit-modal-btn"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
        >
          <template v-if="loading">
            <Loader2 :size="18" class="animate-spin" />
            <span>Menyimpan...</span>
          </template>
          <template v-else>
            <Save :size="18" :stroke-width="2.5" />
            <span>Simpan Perubahan</span>
          </template>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Edit3, Save, X, Loader2 } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, toApiDateTime, toInputDateTime } from "../../../helpers/toolsHelper";
import MarkdownEditor from "../components/MarkdownEditor.vue";

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
const title = ref("");
const description = ref("");
const startBid = ref("");
const closedAt = ref("");

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
  () => [props.aucation, props.show],
  ([aucation, show]) => {
    if (aucation && show) {
      title.value = aucation.title || "";
      description.value = aucation.description || "";
      startBid.value = aucation.start_bid;
      closedAt.value = toInputDateTime(aucation.closed_at);
    }
  },
  { immediate: true }
);

watch(
  () => [aucationsStore.isAucationChange, aucationsStore.isAucationChanged],
  ([isAucationChange, isAucationChanged]) => {
    if (isAucationChange) {
      loading.value = false;
      aucationsStore.setIsAucationChange(false);
      if (isAucationChanged) {
        aucationsStore.setIsAucationChanged(false);
        aucationsStore.asyncSetAucation(props.aucation.id);
        onClose();
      }
    }
  }
);

function handleSave() {
  if (!title.value.trim()) {
    showErrorDialog("Judul tidak boleh kosong");
    return;
  }

  if (!description.value.trim()) {
    showErrorDialog("Deskripsi tidak boleh kosong");
    return;
  }

  if (startBid.value === "" || Number(startBid.value) < 0) {
    showErrorDialog("Harga awal tidak valid");
    return;
  }

  if (!closedAt.value) {
    showErrorDialog("Batas waktu penutupan tidak boleh kosong");
    return;
  }

  loading.value = true;
  aucationsStore.asyncSetIsAucationChange(
    props.aucation.id,
    title.value.trim(),
    description.value.trim(),
    Number(startBid.value),
    toApiDateTime(closedAt.value)
  );
}
</script>
