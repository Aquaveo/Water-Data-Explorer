// useDataStore.js
import { create } from 'zustand';

const useDataStore = create((set, get) => ({
  // ----- STATE -----
  sites: [],
  datastreams: [],

  // ----- ACTIONS -----

  // Add multiple sites at once
  addSites: (newSites) =>
    set((state) => ({
      sites: [...state.sites, ...newSites],
    })),

  // Add multiple datastreams at once
  addDatastreams: (newDatastreams) =>
    set((state) => ({
      datastreams: [...state.datastreams, ...newDatastreams],
    })),

  // Optional: Clear or replace sites/datastreams
  setSites: (newSites) =>
    set({
      sites: newSites,
    }),
  setDatastreams: (newDatastreams) =>
    set({
      datastreams: newDatastreams,
    }),

  getAllSites: () => {
    return get().sites;
  },

  getAllDatastreams: () => {
    return get().datastreams;
  },
}));

export default useDataStore;