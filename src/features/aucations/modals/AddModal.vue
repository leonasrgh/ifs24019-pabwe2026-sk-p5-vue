<template>
  <div
    v-if="show"
    data-testid="add-aucation-modal"
    class="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200 overflow-hidden"
  >
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
          <Plus :size="18" :stroke-width="2.5" />
        </div>
        <div>
          <h2 class="text-base font-bold text-slate-800">Tambah Lelang Baru</h2>
          <p class="text-xs text-slate-600">Tuliskan spesifikasi barang dengan format Markdown</p>
        </div>
      </div>
      <button
        type="button"
        data-testid="close-add-modal-btn"
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
          <label for="add-aucation-title" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Judul Barang <span class="text-red-500">*</span>
          </label>
          <input
            id="add-aucation-title"
            type="text"
            data-testid="add-aucation-title-input"
            v-model="title"
            placeholder="Contoh: Oculus Quest 2"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
            required
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
          <div>
            <label for="add-aucation-start-bid" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Harga Awal (Rp) <span class="text-red-500">*</span>
            </label>
            <input
              id="add-aucation-start-bid"
              type="number"
              min="0"
              data-testid="add-aucation-start-bid-input"
              v-model="startBid"
              placeholder="10000"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
              required
            />
          </div>
          <div>
            <label for="add-aucation-closed-at" class="block text-sm font-semibold text-slate-700 mb-1.5">
              Batas Waktu Penutupan <span class="text-red-500">*</span>
            </label>
            <input
              id="add-aucation-closed-at"
              type="datetime-local"
              data-testid="add-aucation-closed-at-input"
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
              textarea-test-id="add-aucation-description-input"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80 shrink-0">
        <button
          type="button"
          data-testid="cancel-add-modal-btn"
          @click="onClose"
          :disabled="loading"
          class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          data-testid="submit-add-modal-btn"
          :disabled="loading"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
        >
          <template v-if="loading">
            <Loader2 :size="18" class="animate-spin" />
            <span>Menyimpan...</span>
          </template>
          <template v-else>
            <Plus :size="18" :stroke-width="2.5" />
            <span>Tambah Lelang</span>
          </template>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, defineAsyncComponent } from "vue";
import { Plus, X, Loader2 } from "lucide-vue-next";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, toApiDateTime } from "../../../helpers/toolsHelper";
const MarkdownEditor = defineAsyncComponent(() => import("../components/MarkdownEditor.vue"));

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
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
  () => [aucationsStore.isAucationAdd, aucationsStore.isAucationAdded],
  ([isAucationAdd, isAucationAdded]) => {
    if (isAucationAdd) {
      loading.value = false;
      aucationsStore.setIsAucationAdd(false);
      if (isAucationAdded) {
        aucationsStore.setIsAucationAdded(false);
        aucationsStore.asyncReloadAucations();
        title.value = "";
        description.value = "";
        startBid.value = "";
        closedAt.value = "";
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
  aucationsStore.asyncSetIsAucationAdd(
    title.value.trim(),
    description.value.trim(),
    Number(startBid.value),
    toApiDateTime(closedAt.value)
  );
}
</script>
