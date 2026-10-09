<template>
  <div v-if="!profile" class="flex flex-col items-center justify-center py-24">
    <Loader2 :size="36" class="text-indigo-600 animate-spin mb-2" />
    <p class="text-sm font-medium text-slate-600">Memuat data profil...</p>
  </div>

  <div v-else class="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
    <div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Profil Akun
      </h1>
      <p class="text-sm text-slate-500 mt-1">
        Kelola informasi identitas, foto profil, dan keamanan akun Anda.
      </p>
    </div>

    <!-- Profile Card Header -->
    <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
      <div class="relative group">
        <img
          v-if="profile.photo"
          :src="profile.photo"
          :alt="profile.name"
          class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-indigo-100"
        />
        <div
          v-else
          class="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-3xl shadow-md"
        >
          {{ profile.name ? profile.name.charAt(0).toUpperCase() : "U" }}
        </div>

        <label
          data-testid="upload-profile-photo-btn"
          class="absolute bottom-0 right-0 p-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer transition-transform hover:scale-105"
          title="Ubah Foto Profil"
        >
          <Loader2 v-if="loadingPhoto" :size="16" class="animate-spin" />
          <Camera v-else :size="16" />
          <input
            type="file"
            data-testid="profile-photo-file-input"
            accept="image/*"
            @change="handlePhotoUpload"
            class="hidden"
          />
        </label>
      </div>

      <div class="text-center sm:text-left space-y-1">
        <h2 class="text-xl font-bold text-slate-800">{{ profile.name }}</h2>
        <p class="text-sm text-slate-500">{{ profile.email }}</p>
        <div class="pt-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
            <Check :size="14" /> Terverifikasi
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Form Biodata -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div class="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User :size="18" />
          </div>
          <h3 class="font-bold text-slate-800">Ubah Biodata</h3>
        </div>

        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              data-testid="profile-name-input"
              v-model="name"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              data-testid="profile-email-input"
              v-model="email"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div class="pt-2">
            <button
              type="submit"
              data-testid="submit-profile-btn"
              :disabled="loadingProfile"
              class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
            >
              <template v-if="loadingProfile">
                <Loader2 :size="18" class="animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </template>
              <span v-else>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Form Ganti Password -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div class="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck :size="18" />
          </div>
          <h3 class="font-bold text-slate-800">Keamanan & Password</h3>
        </div>

        <form @submit.prevent="handleUpdatePassword" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Kata Sandi Saat Ini
            </label>
            <input
              type="password"
              data-testid="current-password-input"
              v-model="oldPassword"
              placeholder="••••••"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              data-testid="new-password-input"
              v-model="newPassword"
              placeholder="Minimal 6 karakter"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Ulangi Kata Sandi Baru
            </label>
            <input
              type="password"
              data-testid="confirm-password-input"
              v-model="newPasswordConfirmation"
              placeholder="Konfirmasi kata sandi"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              required
            />
          </div>

          <div class="pt-2">
            <button
              type="submit"
              data-testid="submit-password-btn"
              :disabled="loadingPassword"
              class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-md transition-all disabled:opacity-60"
            >
              <template v-if="loadingPassword">
                <Loader2 :size="18" class="animate-spin" />
                <span>Memperbarui Password...</span>
              </template>
              <span v-else>Perbarui Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { User, Camera, Check, Loader2, ShieldCheck } from "lucide-vue-next";

const usersStore = useUsersStore();
const profile = computed(() => usersStore.profile);

// Form states
const name = ref("");
const email = ref("");
const oldPassword = ref("");
const newPassword = ref("");
const newPasswordConfirmation = ref("");

const loadingProfile = ref(false);
const loadingPhoto = ref(false);
const loadingPassword = ref(false);

function syncProfile() {
  if (profile.value) {
    name.value = profile.value.name || "";
    email.value = profile.value.email || "";
  }
}

onMounted(() => {
  syncProfile();
});

watch(profile, () => {
  syncProfile();
});

watch(
  () => usersStore.isChangeProfile,
  (isChange) => {
    if (isChange) {
      loadingProfile.value = false;
      usersStore.setIsChangeProfile(false);
    }
  }
);

watch(
  () => usersStore.isChangeProfilePhoto,
  (isChange) => {
    if (isChange) {
      loadingPhoto.value = false;
      usersStore.setIsChangeProfilePhoto(false);
    }
  }
);

watch(
  () => usersStore.isChangeProfilePassword,
  (isChange) => {
    if (isChange) {
      loadingPassword.value = false;
      usersStore.setIsChangeProfilePassword(false);
      oldPassword.value = "";
      newPassword.value = "";
      newPasswordConfirmation.value = "";
    }
  }
);

function handleUpdateProfile() {
  if (!name.value.trim()) {
    showErrorDialog("Nama tidak boleh kosong!");
    return;
  }
  if (!email.value.trim()) {
    showErrorDialog("Email tidak boleh kosong!");
    return;
  }
  loadingProfile.value = true;
  usersStore.asyncPutProfile(name.value.trim(), email.value.trim());
}

function handlePhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showErrorDialog("Pilih file gambar yang valid!");
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    showErrorDialog("Ukuran file foto maksimal 3MB!");
    return;
  }

  loadingPhoto.value = true;
  usersStore.asyncPostProfilePhoto(file);
}

function handleUpdatePassword() {
  if (!oldPassword.value) {
    showErrorDialog("Kata sandi lama wajib diisi!");
    return;
  }
  if (!newPassword.value || newPassword.value.length < 6) {
    showErrorDialog("Kata sandi baru minimal 6 karakter!");
    return;
  }
  if (newPassword.value !== newPasswordConfirmation.value) {
    showErrorDialog("Konfirmasi kata sandi tidak cocok!");
    return;
  }

  loadingPassword.value = true;
  usersStore.asyncPutProfilePassword(
    oldPassword.value,
    newPassword.value,
    newPasswordConfirmation.value
  );
}
</script>
