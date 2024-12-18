// views/WDEView.js
import {lazy, Suspense } from 'react';
import { Container } from 'views/styledComponents.js';
import LoadingAnimation from 'components/loader/LoadingAnimation';


const MapView = lazy(() => import('features/Map/components/map.js'));
const CatalogMenu = lazy(() => import('features/Catalogs/components/CatalogMenu.js'));


const WDEView = () => {
  
  return (
    <Container>
        <Suspense fallback={<LoadingAnimation />}>
          <CatalogMenu />
          <MapView />
        </Suspense>
    </Container>
  );
};

export default WDEView;
