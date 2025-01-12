import React, {lazy, Suspense,useContext,useEffect } from 'react';
import { AppContext } from "features/react-tethys/context/context";
import useDataStore from 'features/Sites/hooks/useDataStore';
import { useShallow } from 'zustand/react/shallow'

import { Container } from 'views/styledComponents.js';
import LoadingAnimation from 'features/react-tethys/components/loader/LoadingAnimation';


const MapView = lazy(() => import('features/Map/components/Map.js'));
const SidePanel = lazy(() => import('features/List/components/SidePanel.js'));


const WDEView = () => {
  const { backend } = useContext(AppContext);
  const addSites = useDataStore(useShallow((state) => state.addSites));
  

   const addSitesData = (data) => {
    addSites(data);
  }

  useEffect(() => {
    backend.on(backend.actions.GET_SITES, addSitesData);
    backend.do(backend.actions.GET_SITES,{type: 'all'});

    return () => {
      backend.off(backend.actions.GET_SITES);
    };
  }, []);

  return (
    <Container>
        <Suspense fallback={<LoadingAnimation />}>
          <SidePanel />
          <MapView />
        </Suspense>
    </Container>
  );
};

export default WDEView;
