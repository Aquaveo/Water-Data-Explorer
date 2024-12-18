import React from 'react';
import Map from '@planet/maps/Map';
import OSM from '@planet/maps/source/OSM';
import ScaleLine from '@planet/maps/control/ScaleLine';
import View from '@planet/maps/View';
import TileLayer from '@planet/maps/layer/WebGLTile';
import 'ol/ol.css'; 

import useTheme from 'hooks/useTheme';
import useLayoutStore from 'stores/layoutStore';
import { FaDatabase } from "react-icons/fa";

import { ControlButton, StyledMapContainer } from './styledComponents';
import AddMenuButton from './MenuButton';

const MapComponent = () => {
  const theme = useTheme();
  const { toggleSidePanelVisibility, showCatalogList, isSidePanelVisible } = useLayoutStore();

  const handleShowCatalogList = () => {
    // Switch to CatalogList content
    showCatalogList();

    // Only toggle visibility if the panel is currently hidden
    if (!isSidePanelVisible) {
      toggleSidePanelVisibility();
    }
  };

  return (
    <StyledMapContainer theme={theme}>
      <Map>
        <View options={{center: [0, 0], zoom: 1}} />
        <TileLayer>
          <OSM />
        </TileLayer>
        <ScaleLine />
      </Map>
      <AddMenuButton />
      <ControlButton onClick={handleShowCatalogList}>
        <FaDatabase size={20} />
      </ControlButton>
    </StyledMapContainer>
  );
};

export default MapComponent;
