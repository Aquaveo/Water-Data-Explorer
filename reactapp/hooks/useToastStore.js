// useToastStore.js
import { create } from 'zustand';
import { toast } from 'react-toastify';

const useToastStore = create((set, get) => ({
  loadingToastId: null,

  showLoadingToast: (msg = 'Loading data...') => {
    const id = toast(msg, { type: 'info', autoClose: false });
    set({ loadingToastId: id });
  },

  updateToSuccessToast: (msg = 'Success!') => {
    const { loadingToastId } = get();
    if (loadingToastId) {
      toast.update(loadingToastId, {
        render: msg,
        type: 'success',
        autoClose: 3000,
      });
      // optionally reset the reference
      set({ loadingToastId: null });
    }
  },
  
}));

export default useToastStore;
