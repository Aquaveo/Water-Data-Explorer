import { Fragment, useState, lazy,Suspense } from 'react';
import { MapContainer } from '../components/StyledContainers.js';
import LoadingAnimation from 'components/loader/LoadingAnimation';

const MapComponent = lazy(() => import('features/Map/components/map.js'));

const WDEView = () => {
  const [singleRowOn, toggleSingleRow] = useState(true);
  const [ isLoading, setIsLoading ] = useState(false);

  return (
    <Fragment>
      <MapContainer fullScreen={singleRowOn}>
        <MapComponent />
      </MapContainer>
    </Fragment>
  );
};

export default WDEView;
