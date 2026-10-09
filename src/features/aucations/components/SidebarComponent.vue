<template>
  <div>
    <!-- Mobile Backdrop -->
    <div
      v-if="isSidebarOpen"
      data-testid="sidebar-backdrop"
      @click="emit('close-mobile')"
      class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
    />

    <aside
      class="fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out md:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex flex-col h-full justify-between">
        <div class="space-y-6">
          <div>
            <p class="px-3 text-xs font-bold uppercase tracking-wider text-slate-600">
              Menu Utama
            </p>
            <nav class="mt-3 space-y-1">
              <RouterLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                custom
                v-slot="{ href, navigate }"
              >
                <a
                  :href="href"
                  @click="onNavigate($event, navigate)"
                  class="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
                  :class="
                    item.isActive(route)
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  "
                >
                  <div class="flex items-center gap-3">
                    <component :is="item.icon" :size="20" />
                    <span>{{ item.label }}</span>
                  </div>
                  <ChevronRight v-if="item.isActive(route)" :size="16" />
                </a>
              </RouterLink>
            </nav>
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100/60">
          <p class="text-xs font-semibold text-indigo-900">Praktikum 5 PABWE</p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { RouterLink, useRoute } from "vue-router";
import { LayoutDashboard, ClipboardList, Users, UserCircle, ChevronRight } from "lucide-vue-next";

defineProps({
  isSidebarOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close-mobile"]);

const route = useRoute();

const navItems = [
  {
    to: "/",
    label: "Dashboard Lelang",
    icon: LayoutDashboard,
    isActive: (r) =>
      (r.path === "/" && r.query.tab !== "mine") || r.path.startsWith("/aucations/"),
  },
  {
    to: "/?tab=mine",
    label: "Lelang Saya",
    icon: ClipboardList,
    isActive: (r) => r.path === "/" && r.query.tab === "mine",
  },
  {
    to: "/users",
    label: "Daftar Pengguna",
    icon: Users,
    isActive: (r) => r.path === "/users",
  },
  {
    to: "/profile",
    label: "Profil Saya",
    icon: UserCircle,
    isActive: (r) => r.path === "/profile",
  },
];

function onNavigate(event, navigate) {
  navigate(event);
  emit("close-mobile");
}
</script>
