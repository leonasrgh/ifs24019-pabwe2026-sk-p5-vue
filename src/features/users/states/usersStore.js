import { defineStore } from "pinia";
import userApi from "../api/userApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const useUsersStore = defineStore("users", {
  state: () => ({
    users: [],
    user: null,
    profile: null,
    isProfile: false,
    isChangeProfile: false,
    isChangeProfilePhoto: false,
    isChangeProfilePassword: false,
  }),
  actions: {
    setUsers(users) {
      this.users = users;
    },
    setUser(user) {
      this.user = user;
    },
    setProfile(profile) {
      this.profile = profile;
    },
    setIsProfile(status) {
      this.isProfile = status;
    },
    setIsChangeProfile(status) {
      this.isChangeProfile = status;
    },
    setIsChangeProfilePhoto(status) {
      this.isChangeProfilePhoto = status;
    },
    setIsChangeProfilePassword(status) {
      this.isChangeProfilePassword = status;
    },
    async asyncSetUsers() {
      try {
        const users = await userApi.getUsers();
        this.setUsers(users);
      } catch (error) {
        this.setUsers([]);
      }
    },
    async asyncSetUserById(userId) {
      try {
        const user = await userApi.getUserById(userId);
        this.setUser(user);
      } catch (error) {
        this.setUser(null);
      }
    },
    async asyncSetProfile() {
      try {
        const profile = await userApi.getProfile();
        this.setProfile(profile);
      } catch (error) {
        this.setProfile(null);
      } finally {
        this.setIsProfile(true);
      }
    },
    async asyncPutProfile(name, email) {
      try {
        const profile = await userApi.putProfile(name, email);
        this.setProfile(profile);
        showSuccessDialog("Profil berhasil diperbarui!");
        this.setIsChangeProfile(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsChangeProfile(false);
      }
    },
    async asyncPostProfilePhoto(photo) {
      try {
        const message = await userApi.postProfilePhoto(photo);
        showSuccessDialog(message || "Foto profil berhasil diperbarui!");
        const profile = await userApi.getProfile();
        this.setProfile(profile);
        this.setIsChangeProfilePhoto(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsChangeProfilePhoto(false);
      }
    },
    async asyncPutProfilePassword(oldPassword, newPassword, newPasswordConfirmation) {
      try {
        const message = await userApi.putProfilePassword(oldPassword, newPassword, newPasswordConfirmation);
        showSuccessDialog(message || "Kata sandi berhasil diperbarui!");
        this.setIsChangeProfilePassword(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsChangeProfilePassword(false);
      }
    },
  },
});
