import React, { useRef, useCallback, useState } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import styled from "styled-components";

import useTheme from "hooks/useTheme";
import useLayoutStore from "stores/layoutStore";
import useDataStore from "features/Sites/hooks/useDataStore";
import { FaDatabase } from "react-icons/fa";

import { ControlButton, StyledMapContainer } from "./styledComponents";
import AddMenuButton from "./MenuButton";

const Tooltip = styled.div`
  position: absolute;
  margin: 8px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  max-width: 300px;
  font-size: 10px;
  z-index: 9;
  pointer-events: none;
`;

const clusterLayer = {
  id: "clusters",
  type: "circle",
  source: "sites",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#8E4162", // Secondary color for clusters with point_count < 10
      10,
      "#E98A15", // Warning color for clusters with point_count < 50
      50,
      "#84CAE7", // Info color for clusters with point_count >= 50
    ],
    "circle-radius": [
      "step",
      ["get", "point_count"],
      15,
      10,
      20,
      50,
      25,
    ],
  },
};

const clusterCountLayer = {
  id: "cluster-count",
  type: "symbol",
  source: "sites",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
  paint: {
    "text-color": "white",
  },
};

const unclusteredPointLayer = {
  id: "unclustered-point",
  type: "circle",
  source: "sites",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#ACE894",
    "circle-radius": 8,
    "circle-stroke-width": 2,
    "circle-stroke-color": "white",
  },
};

const onMapLoad = (event) => {
  const map = event.target;

  // Handle cursor change for only `unclustered-point` layer
  map.on("mouseenter", "unclustered-point", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "unclustered-point", () => {
    map.getCanvas().style.cursor = "";
  });

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });

};

const MapComponent = () => {
  const theme = useTheme();
  const { toggleSidePanelVisibility, showSiteList, isSidePanelVisible } =
    useLayoutStore();
  const sites = useDataStore((state) => state.getAllSites());

  const [popupInfo, setPopupInfo] = useState(null);
  const mapRef = useRef(null);

  const geojsonData = {
    type: "FeatureCollection",
    features: sites
      .filter((site) => site.longitude !== null && site.latitude !== null)
      .map((site) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [site.longitude, site.latitude],
        },
        properties: site,
      })),
  };

  const onHover = useCallback((event) => {
    const { features } = event;
    const hoveredFeature =
      features &&
      features.find((feature) => feature.layer.id === "unclustered-point");

    if (hoveredFeature) {
      setPopupInfo({
        feature: hoveredFeature,
        longitude: hoveredFeature.geometry.coordinates[0],
        latitude: hoveredFeature.geometry.coordinates[1],
      });
    } else {
      setPopupInfo(null);
    }
  }, []);

  const handleShowSiteList = () => {
    showSiteList();
    if (!isSidePanelVisible) {
      toggleSidePanelVisibility();
    }
  };

  const handleMapClick = (event) => {
    const map = event.target;

    // Prioritize clicking on 'unclustered-point' and 'clusters' layers first
    const features = map.queryRenderedFeatures(event.point, {
      layers: ['unclustered-point', 'clusters'],
    });

    if (features.length > 0) {
      // Loop through all features at the click point
      for (const feature of features) {
        const layerId = feature.layer.id;
        if (layerId === 'unclustered-point') {
          const { properties } = feature;
          // setPopupInfo(properties);
          return;
        } 
        else if (layerId === 'clusters') {
          setPopupInfo(null);
          console.log("hey")
          const clusterId = feature.properties.cluster_id;
          map.getSource('sites').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) {
              return;
            }
      
            mapRef.current.easeTo({
              center: feature.geometry.coordinates,
              zoom,
              duration: 1000
            });
          });
          
          return;
        }
      }
    }
  };


  return (
    <StyledMapContainer theme={theme}>
      <Map
        initialViewState={{
          longitude: -96,
          latitude: 40,
          zoom: 4,
        }}
        mapStyle="https://api.maptiler.com/maps/openstreetmap/style.json?key=wiM3UexBscV7exuZmApI"
        interactiveLayerIds={["unclustered-point"]}
        mapLib={maplibregl}
        onMouseMove={onHover}
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        onLoad={onMapLoad}
        onClick={handleMapClick}
      >
        <Source
          id="sites"
          type="geojson"
          data={geojsonData}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="top"
            
            onClose={() => setPopupInfo(null)}
          >
            <Tooltip>
              <div>Site: {popupInfo.feature.properties.name}</div>
              <div>ID: {popupInfo.feature.properties.id}</div>
              <div>Type: {popupInfo.feature.properties.type}</div>
            </Tooltip>
          </Popup>
        )}
      </Map>
      <AddMenuButton />
      <ControlButton onClick={handleShowSiteList}>
        <FaDatabase size={20} />
      </ControlButton>
    </StyledMapContainer>
  );
};

export default MapComponent;
