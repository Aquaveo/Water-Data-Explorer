import { create } from 'zustand';

const useLayoutStore = create((set) => ({
  isSidePanelVisible: false,
  currentOffCanvasView: 'siteList',
  isTimeSeriesPanelVisible: false,


  toggleSidePanelVisibility: () => {
    set((state) => ({
      isSidePanelVisible: !state.isSidePanelVisible 
  }))},

  showSiteList: () => set({ currentOffCanvasView: 'siteList' }),

  showImportCatalogMenu: () => set({
    currentOffCanvasView: 'importCatalogMenu',
    isSidePanelVisible: true
  }),

  showTimeSeriesPanel: () => set({
    isTimeSeriesPanelVisible: true
  }),

  toggleTimeSeriesPanelVisibility: () => {
    set((state) => ({
      isTimeSeriesPanelVisible: !state.isTimeSeriesPanelVisible 
  }))},

}));

export default useLayoutStore;
