import {create} from 'zustand';

const useLayoutStore = create((set) => ({
  isSidePanelVisible: false,
  toggleSidePanelVisibility: () => set((state) => ({ isSidePanelVisible: !state.isSidePanelVisible })),
}));

export default useLayoutStore;
