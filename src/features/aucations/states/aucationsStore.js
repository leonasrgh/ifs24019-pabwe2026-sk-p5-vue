import { defineStore } from "pinia";
import aucationApi from "../api/aucationApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const useAucationsStore = defineStore("aucations", {
  state: () => ({
    aucations: [],
    aucation: null,
    isAucation: false,
    query: {},
    isAucationAdd: false,
    isAucationAdded: false,
    isAucationChange: false,
    isAucationChanged: false,
    isAucationChangeCover: false,
    isAucationChangedCover: false,
    isAucationDelete: false,
    isAucationDeleted: false,
    isBidAdd: false,
    isBidAdded: false,
    isBidDelete: false,
    isBidDeleted: false,
    isAucationDeleteAll: false,
    isAucationDeletedAll: false,
  }),
  actions: {
    setAucations(aucations) {
      this.aucations = aucations;
    },
    setAucation(aucation) {
      this.aucation = aucation;
    },
    setIsAucation(status) {
      this.isAucation = status;
    },
    setIsAucationAdd(status) {
      this.isAucationAdd = status;
    },
    setIsAucationAdded(status) {
      this.isAucationAdded = status;
    },
    setIsAucationChange(status) {
      this.isAucationChange = status;
    },
    setIsAucationChanged(status) {
      this.isAucationChanged = status;
    },
    setIsAucationChangeCover(status) {
      this.isAucationChangeCover = status;
    },
    setIsAucationChangedCover(status) {
      this.isAucationChangedCover = status;
    },
    setIsAucationDelete(status) {
      this.isAucationDelete = status;
    },
    setIsAucationDeleted(status) {
      this.isAucationDeleted = status;
    },
    setIsBidAdd(status) {
      this.isBidAdd = status;
    },
    setIsBidAdded(status) {
      this.isBidAdded = status;
    },
    setIsBidDelete(status) {
      this.isBidDelete = status;
    },
    setIsBidDeleted(status) {
      this.isBidDeleted = status;
    },
    setIsAucationDeleteAll(status) {
      this.isAucationDeleteAll = status;
    },
    setIsAucationDeletedAll(status) {
      this.isAucationDeletedAll = status;
    },
    async asyncSetAucations(params = {}) {
      this.query = params;
      try {
        const aucations = await aucationApi.getAucations(params);
        this.setAucations(aucations);
      } catch (error) {
        this.setAucations([]);
      }
    },
    async asyncReloadAucations() {
      await this.asyncSetAucations(this.query);
    },
    async asyncSetAucation(aucationId) {
      try {
        const aucation = await aucationApi.getAucationById(aucationId);
        this.setAucation(aucation);
      } catch (error) {
        this.setAucation(null);
      } finally {
        this.setIsAucation(true);
      }
    },
    async asyncSetIsAucationAdd(title, description, startBid, closedAt) {
      try {
        await aucationApi.postAucation(title, description, startBid, closedAt);
        showSuccessDialog("Lelang berhasil ditambahkan!");
        this.setIsAucationAdded(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsAucationAdded(false);
      } finally {
        this.setIsAucationAdd(true);
      }
    },
    async asyncSetIsAucationChange(aucationId, title, description, startBid, closedAt) {
      try {
        const message = await aucationApi.putAucation(aucationId, title, description, startBid, closedAt);
        showSuccessDialog(message || "Lelang berhasil diperbarui!");
        this.setIsAucationChanged(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsAucationChanged(false);
      } finally {
        this.setIsAucationChange(true);
      }
    },
    async asyncSetIsAucationChangeCover(aucationId, cover) {
      try {
        const message = await aucationApi.postAucationCover(aucationId, cover);
        showSuccessDialog(message || "Cover berhasil diperbarui!");
        this.setIsAucationChangedCover(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsAucationChangedCover(false);
      } finally {
        this.setIsAucationChangeCover(true);
      }
    },
    async asyncSetIsAucationDelete(aucationId) {
      try {
        const message = await aucationApi.deleteAucation(aucationId);
        showSuccessDialog(message || "Lelang berhasil dihapus!");
        this.setIsAucationDeleted(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsAucationDeleted(false);
      } finally {
        this.setIsAucationDelete(true);
      }
    },
    async asyncSetIsBidAdd(aucationId, bid) {
      try {
        const message = await aucationApi.postBid(aucationId, bid);
        showSuccessDialog(message || "Penawaran berhasil diajukan!");
        this.setIsBidAdded(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsBidAdded(false);
      } finally {
        this.setIsBidAdd(true);
      }
    },
    async asyncSetIsBidDelete(aucationId) {
      try {
        const message = await aucationApi.deleteBid(aucationId);
        showSuccessDialog(message || "Penawaran berhasil dihapus!");
        this.setIsBidDeleted(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsBidDeleted(false);
      } finally {
        this.setIsBidDelete(true);
      }
    },
    async asyncSetIsAucationDeleteAll() {
      try {
        const message = await aucationApi.deleteAllAucations();
        showSuccessDialog(message || "Semua lelang berhasil dihapus!");
        this.setIsAucationDeletedAll(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsAucationDeletedAll(false);
      } finally {
        this.setIsAucationDeleteAll(true);
      }
    },
  },
});
