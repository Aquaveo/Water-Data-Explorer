import { create } from 'zustand';

const useLayoutStore = create((set) => ({
  isSidePanelVisible: false,
  currentOffCanvasView: 'catalogList', // default view

  toggleSidePanelVisibility: () => {
    set((state) => ({
      isSidePanelVisible: !state.isSidePanelVisible 
  }))},

  showCatalogList: () => set({ currentOffCanvasView: 'catalogList' }),

  showImportCatalogMenu: () => set({
    currentOffCanvasView: 'importCatalogMenu',
    isSidePanelVisible: true // ensure panel is visible
  })
}));

export default useLayoutStore;
