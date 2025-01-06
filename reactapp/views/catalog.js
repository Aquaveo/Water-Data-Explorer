// views/WDEView.js
import React, {lazy, Suspense,useContext,useEffect } from 'react';
import { AppContext } from "features/react-tethys/context/context";
import useCatalogStore from 'features/Catalogs/hooks/useCatalogStore';
import { useShallow } from 'zustand/react/shallow'

import { Container } from 'views/styledComponents.js';
import LoadingAnimation from 'features/react-tethys/components/loader/LoadingAnimation';
import { add } from 'ol/coordinate';

const MapView = lazy(() => import('features/Map/components/Map.js'));
const SidePanel = lazy(() => import('features/List/components/SidePanel.js'));


const WDEView = () => {
  const { backend } = useContext(AppContext);
  const addCatalogs = useCatalogStore(useShallow((state) => state.addCatalogs));
  const addViews = useCatalogStore(useShallow((state) => state.addViews));
  const addSites = useCatalogStore(useShallow((state) => state.addSites));
  
  const addCatalogsAndViewsData = (catalogs) => {
    addCatalogs(catalogs);
    for (const catalog of catalogs){
      addViews(catalog.views);
    }
  }
   const addSitesData = (data) => {
    console.log(data);
    addSites(data);
  }

  useEffect(() => {
    backend.on(backend.actions.GET_LIST_CATALOGS, addCatalogsAndViewsData);
    backend.do(backend.actions.GET_LIST_CATALOGS,{type: 'his'});
    backend.on(backend.actions.GET_SITES, addSitesData);
    backend.do(backend.actions.GET_SITES,{type: 'all'});

    return () => {
      backend.off(backend.actions.GET_LIST_CATALOGS);
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
