import { create } from 'zustand';

const useLayoutStore = create((set) => ({
  isSidePanelVisible: false,
  currentOffCanvasView: 'siteList', // default view

  toggleSidePanelVisibility: () => {
    set((state) => ({
      isSidePanelVisible: !state.isSidePanelVisible 
  }))},

  showSiteList: () => set({ currentOffCanvasView: 'siteList' }),

  showImportCatalogMenu: () => set({
    currentOffCanvasView: 'importCatalogMenu',
    isSidePanelVisible: true // ensure panel is visible
  })
}));

export default useLayoutStore;
