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
  const addView = useCatalogStore(useShallow((state) => state.addView));
  const addViews = useCatalogStore(useShallow((state) => state.addViews));
  
  const addData = (catalogs) => {
    
    addCatalogs(catalogs);
    for (const catalog of catalogs){
      console.log('views',catalog.views);
      addViews(catalog.views);
    }
  }

  useEffect(() => {
    backend.on(backend.actions.GET_LIST_CATALOGS, addData);
    backend.on(backend.actions.SEND_GET_VIEW, addView);
    backend.do(backend.actions.GET_LIST_CATALOGS,{type: 'his'});
    return () => {
      backend.off(backend.actions.GET_LIST_CATALOGS);
      backend.off(backend.actions.SEND_GET_VIEW);

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
