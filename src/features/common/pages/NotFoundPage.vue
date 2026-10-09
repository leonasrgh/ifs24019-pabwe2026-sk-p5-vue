<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
    <div class="max-w-md w-full text-center">
      <!-- Decorative Badge -->
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm ring-8 ring-indigo-50/50 animate-bounce duration-1000">
        <TriangleAlert :size="40" :stroke-width="2" />
      </div>

      <!-- Status Code & Headings -->
      <h1 class="text-7xl sm:text-8xl font-black text-slate-900 tracking-tight">
        404
      </h1>
      <h2 class="mt-3 text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
        Halaman Tidak Ditemukan
      </h2>
      <p class="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed">
        Maaf, rute atau halaman yang Anda cari tidak tersedia, telah dipindahkan, atau tidak pernah ada.
      </p>

      <!-- Action Buttons -->
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          data-testid="back-btn"
          @click="router.go(-1)"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft :size="18" />
          <span>Kembali</span>
        </button>
        <button
          type="button"
          data-testid="home-btn"
          @click="router.push('/')"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
        >
          <Home :size="18" />
          <span>Ke Halaman Utama</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { TriangleAlert, ArrowLeft, Home } from "lucide-vue-next";

const router = useRouter();
</script>
