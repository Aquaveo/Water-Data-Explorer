// useDataStore.js
import { create } from 'zustand';

const useDataStore = create((set, get) => ({
  sites: [],
  filteredSites: [],
  datastreams: [],

  addSites: (newSites) =>
    set((state) => ({
      sites: [...state.sites, ...newSites],
      filteredSites: [...state.sites, ...newSites],
    })),

  addDatastreams: (newDatastreams) =>
    set((state) => ({
      datastreams: [...state.datastreams, ...newDatastreams],
    })),

  setSites: (newSites) =>
    set({
      sites: newSites,
      filteredSites: newSites,
    }),
  setFilteredSites: (filteredSites) =>
    set({
      filteredSites,
    }),


  setDatastreams: (newDatastreams) =>
    set({
      datastreams: newDatastreams,
    }),

  getAllSites: () => {
    return get().sites;
  },

  getFilteredSites: () => {
    return get().filteredSites;
  },

  getAllDatastreams: () => {
    return get().datastreams;
  },
}));

export default useDataStore;