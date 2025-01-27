// useDataStore.js
import { create } from 'zustand';

const useDataStore = create((set, get) => ({
  sites: [],
  filteredSites: [],
  datastreams: [],
  current_site: null,
  current_datastreams: [],

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


  setCurrentSite: (site) =>
    set({
      current_site: site,
    }),

  setCurrentDatastreams: (datastreams) =>
    set({
      current_datastreams: datastreams,
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

  getCurrentSite: () => {
    return get().current_site;
  },
  
  getCurrentDatastreams: () => {
    return get().current_datastreams;
  },
}));

export default useDataStore;