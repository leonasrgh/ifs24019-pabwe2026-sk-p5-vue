import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createAppRouter } from "./router";
import { createMemoryHistory } from "vue-router";
import { useAuthStore } from "./features/auth/states/authStore";
import { useUsersStore } from "./features/users/states/usersStore";
import { useAucationsStore } from "./features/aucations/states/aucationsStore";

export function createMockPinia(initialState = {}) {
  const pinia = createPinia();
  setActivePinia(pinia);

  const authStore = useAuthStore(pinia);
  const usersStore = useUsersStore(pinia);
  const aucationsStore = useAucationsStore(pinia);

  Object.entries(initialState).forEach(([key, val]) => {
    if (key in authStore.$state) authStore.$state[key] = val;
    if (key in usersStore.$state) usersStore.$state[key] = val;
    if (key in aucationsStore.$state) aucationsStore.$state[key] = val;
  });

  return { pinia, authStore, usersStore, aucationsStore };
}

export function renderWithProviders(
  component,
  {
    preloadedState = {},
    pinia = null,
    router = createAppRouter(createMemoryHistory()),
    props = {},
    slots = {},
    attachTo = undefined,
    ...mountOptions
  } = {}
) {
  const { pinia: activePinia, authStore, usersStore, aucationsStore } = pinia
    ? {
        pinia,
        authStore: useAuthStore(pinia),
        usersStore: useUsersStore(pinia),
        aucationsStore: useAucationsStore(pinia),
      }
    : createMockPinia(preloadedState);

  const wrapper = mount(component, {
    props,
    slots,
    attachTo,
    global: {
      plugins: [activePinia, router],
      stubs: mountOptions.global?.stubs,
      mocks: mountOptions.global?.mocks,
    },
    ...mountOptions,
  });

  return {
    wrapper,
    pinia: activePinia,
    authStore,
    usersStore,
    aucationsStore,
    router,
    container: wrapper.element,
  };
}
