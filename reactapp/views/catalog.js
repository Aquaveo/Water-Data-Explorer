// views/WDEView.js
import {lazy, Suspense } from 'react';
import { Container } from 'views/styledComponents.js';
import LoadingAnimation from 'features/react-tethys/components/loader/LoadingAnimation';


const MapView = lazy(() => import('features/Map/components/Map.js'));
const SidePanel = lazy(() => import('features/List/components/SidePanel.js'));


const WDEView = () => {
  
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
