// useDataStore.js
import { create } from 'zustand';

const useDataStore = create((set, get) => ({
  sites: [],
  datastreams: [],

  addSites: (newSites) =>
    set((state) => ({
      sites: [...state.sites, ...newSites],
    })),

  addDatastreams: (newDatastreams) =>
    set((state) => ({
      datastreams: [...state.datastreams, ...newDatastreams],
    })),

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