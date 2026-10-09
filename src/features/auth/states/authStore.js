import { defineStore } from "pinia";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
  }),
  actions: {
    setIsAuthLogin(value) {
      this.isAuthLogin = value;
    },
    setIsAuthRegister(value) {
      this.isAuthRegister = value;
    },
    setIsAuthLogout(value) {
      this.isAuthLogout = value;
    },
    async asyncSetIsAuthLogin(email, password) {
      try {
        const data = await authApi.postLogin(email, password);
        apiHelper.putAccessToken(data.token);
        this.setIsAuthLogin(true);
      } catch (error) {
        this.setIsAuthLogin(false);
        showErrorDialog(error.message);
      }
    },
    async asyncSetIsAuthRegister(name, email, password) {
      try {
        const message = await authApi.postRegister(name, email, password);
        this.setIsAuthRegister(true);
        showSuccessDialog(message);
      } catch (error) {
        this.setIsAuthRegister(false);
        showErrorDialog(error.message);
      }
    },
    async asyncSetIsAuthLogout() {
      try {
        await authApi.postLogout();
      } catch (error) {
        // Still proceed with clearing token locally even if server error
      } finally {
        apiHelper.putAccessToken("");
        this.setIsAuthLogout(true);
      }
    },
  },
});
