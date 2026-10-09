<template>
  <form @submit.prevent="onSubmitHandler" class="space-y-4">
    <div>
      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
        Alamat Email
      </label>
      <div class="relative">
        <Mail
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
        />
        <input
          type="email"
          id="login-email-input"
          data-testid="login-email-input"
          v-model="email"
          placeholder="nama@email.com"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          required
        />
      </div>
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
        Kata Sandi
      </label>
      <div class="relative">
        <Lock
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
        />
        <input
          type="password"
          id="login-password-input"
          data-testid="login-password-input"
          v-model="password"
          placeholder="••••••••"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          required
        />
      </div>
    </div>

    <div class="pt-2">
      <button
        type="submit"
        id="login-submit-button"
        data-testid="login-submit-button"
        :disabled="loading"
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
      >
        <template v-if="loading">
          <Loader2 :size="18" class="animate-spin" />
          <span>Sedang Masuk...</span>
        </template>
        <template v-else>
          <LogIn :size="18" :stroke-width="2.5" />
          <span>Masuk Sekarang</span>
        </template>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";
import { Mail, Lock, Loader2, LogIn } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";

const authStore = useAuthStore();
const usersStore = useUsersStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

watch(
  () => authStore.isAuthLogin,
  (isAuthLogin) => {
    if (isAuthLogin === true) {
      const authToken = apiHelper.getAccessToken();
      if (authToken) {
        usersStore.asyncSetProfile();
      } else {
        loading.value = false;
        authStore.setIsAuthLogin(false);
      }
    }
  }
);

watch(
  () => usersStore.isProfile,
  (isProfile) => {
    if (isProfile) {
      loading.value = false;
      authStore.setIsAuthLogin(false);
      usersStore.setIsProfile(false);
    }
  }
);

async function onSubmitHandler() {
  loading.value = true;
  try {
    await authStore.asyncSetIsAuthLogin(email.value, password.value);
    if (!apiHelper.getAccessToken()) {
      loading.value = false;
    }
  } catch {
    loading.value = false;
  }
}
</script>
