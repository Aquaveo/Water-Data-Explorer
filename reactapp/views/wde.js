import React, {lazy, Suspense,useContext,useEffect, useState } from 'react';
import { AppContext } from "features/react-tethys/context/context";
import useDataStore from 'features/Sites/hooks/useDataStore';
import { useShallow } from 'zustand/react/shallow'
import { Container } from 'views/styledComponents.js';
import LoadingAnimation from 'features/react-tethys/components/loader/LoadingAnimation';
import { ToastContainer } from 'react-toastify';


const MapView = lazy(() => import('features/Map/components/Map.js'));
const SidePanel = lazy(() => import('views/SidePanel.js'));
const SeriesPanel = lazy(() => import('features/Sites/views/SeriesPanel'));

const WDEView = () => {
  const { backend } = useContext(AppContext);
  const addSites = useDataStore(useShallow((state) => state.addSites));
  const [siteInfoVariables, setSiteInfoVariables] = useState([]);

   const addSitesData = (data) => {
    addSites(data);
    
  }
  const setSiteInfoVariableHandler = (data) => {
    setSiteInfoVariables(data);
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
        <MapView />
        <SeriesPanel variableList={siteInfoVariables} />
        <ToastContainer />
      </Suspense>
  </Container>
    </>

  );
};

export default WDEView;
