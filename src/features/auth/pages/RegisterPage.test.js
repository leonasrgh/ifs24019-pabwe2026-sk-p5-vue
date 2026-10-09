import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "./RegisterPage.vue";
import { renderWithProviders } from "../../../test-utils";

const mockRouter = {
  push: vi.fn(),
};

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...actual,
    useRouter: () => mockRouter,
  };
});

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render inputs and dispatch registration", async () => {
    const { wrapper, authStore } = renderWithProviders(RegisterPage, {
      preloadedState: {
        isAuthRegister: false,
      },
    });

    const registerSpy = vi
      .spyOn(authStore, "asyncSetIsAuthRegister")
      .mockReturnValue(Promise.resolve());

    const nameInput = wrapper.find('[data-testid="register-name-input"]');
    const emailInput = wrapper.find('[data-testid="register-email-input"]');
    const passwordInput = wrapper.find('[data-testid="register-password-input"]');
    const submitBtn = wrapper.find('[data-testid="register-submit-button"]');

    await nameInput.setValue("Delcom User");
    await emailInput.setValue("user@delcom.org");
    await passwordInput.setValue("password123");
    await submitBtn.trigger("submit");

    expect(registerSpy).toHaveBeenCalledWith(
      "Delcom User",
      "user@delcom.org",
      "password123"
    );
  });

  it("should reset form fields and navigate to /auth/login on isAuthRegister success", async () => {
    const { authStore } = renderWithProviders(RegisterPage, {
      preloadedState: {
        isAuthRegister: false,
      },
    });

    authStore.setIsAuthRegister(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockRouter.push).toHaveBeenCalledWith("/auth/login");
  });

  it("should handle error state when isAuthRegister is false while loading", async () => {
    const { wrapper, authStore } = renderWithProviders(RegisterPage, {
      preloadedState: {
        isAuthRegister: null,
      },
    });

    const submitBtn = wrapper.find('[data-testid="register-submit-button"]');
    await submitBtn.trigger("submit");

    authStore.setIsAuthRegister(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="register-submit-button"]').attributes("disabled")).toBeUndefined();
  });
});
