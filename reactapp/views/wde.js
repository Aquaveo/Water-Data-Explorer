import React, {lazy, Suspense,useContext,useEffect, useCallback,useRef } from 'react';
import { AppContext } from "features/react-tethys/context/context";
import useDataStore from 'features/Sites/hooks/useDataStore';
import { useShallow } from 'zustand/react/shallow'
import { Container } from 'views/styledComponents.js';
import LoadingAnimation from 'features/react-tethys/components/loader/LoadingAnimation';
import { ToastContainer } from 'react-toastify';
import useLayoutStore from 'stores/useLayoutStore';
import { toast } from "react-toastify";

const MapView = lazy(() => import('features/Map/components/Map.js'));
const SidePanel = lazy(() => import('views/SidePanel.js'));
const SeriesPanel = lazy(() => import('features/Sites/views/SeriesPanel'));

const WDEView = () => {
  const { backend } = useContext(AppContext);
  const addSites = useDataStore(useShallow((state) => state.addSites));
  const setCurrentDatastreams = useDataStore(useShallow((state) => state.setCurrentDatastreams));
  
  // const [loadingToastId, setLoadingToastId] = useState(null);
  const loadingToastId = useRef(null);

  const showLoadingToast = useCallback(() => {
    // Create a toast that doesn't auto-close
    const id = toast("Loading Data...", { type: "info", autoClose: false });
    loadingToastId.current= id;
  }, []);

  const updateToSuccessToast = useCallback(() => {
    if (loadingToastId.current) {
      toast.update(loadingToastId.current, {
        render: "Sucess...",
        type: "sucess",
        autoClose: 3000, // now it will close after 3s
      });
    }
  }, [loadingToastId.current]);

  const { showTimeSeriesPanel } = useLayoutStore();
   const addSitesData = (data) => {
    addSites(data);
    
  }
  const setSiteInfoVariableHandler = (data) => {
    console.log("Site Info", data);
    showTimeSeriesPanel()
    setCurrentDatastreams(data);
    updateToSuccessToast();
  }

  useEffect(() => {
    backend.on(backend.actions.GET_SITES, addSitesData);
    backend.do(backend.actions.GET_SITES,{type: 'all'});
    backend.on(backend.actions.GET_SITE_INFO, setSiteInfoVariableHandler);

    return () => {
      backend.off(backend.actions.GET_SITES);
      backend.off(backend.actions.GET_SITE_INFO);
    };
  }, []);

  return (
    <>
    
      <Container>
      
        <Suspense fallback={<LoadingAnimation />}>

        <SidePanel />
        <MapView showLoadingToast={showLoadingToast}/>
        <SeriesPanel showLoadingToast={showLoadingToast} updateToSuccessToast={updateToSuccessToast}/>
        <ToastContainer />
      </Suspense>
  </Container>
    </>

  );
};

export default WDEView;
