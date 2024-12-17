import React from 'react';
import Map from '@planet/maps/Map';
import OSM from '@planet/maps/source/OSM';
import ScaleLine from '@planet/maps/control/ScaleLine';
import View from '@planet/maps/View';
import TileLayer from '@planet/maps/layer/WebGLTile';
import 'ol/ol.css'; 

import useTheme from 'hooks/useTheme';
import useLayoutStore from 'stores/layoutStore';
import { FaListOl  } from 'react-icons/fa'; // or any icon you prefer
import { ControlButton, StyledMapContainer } from './styledComponents';
import AddMenuButton from './menuButton';


const MapComponent = () => {
  const theme = useTheme();
  const { toggleSidePanelVisibility } = useLayoutStore();

  return (
    <StyledMapContainer theme={theme}>
      <Map style={{width: '100%', height: '100%'}}>
        <View options={{center: [0, 0], zoom: 1}} />
        <TileLayer>
          <OSM />
        </TileLayer>
        <ScaleLine />
      </Map>
      <AddMenuButton />
      <ControlButton onClick={toggleSidePanelVisibility}>
        <FaListOl size={20} />
     </ControlButton>

    </StyledMapContainer>
  );
};

export default MapComponent;
