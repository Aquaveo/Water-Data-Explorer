import React, { useRef, useCallback, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

import useTheme from "hooks/useTheme";
import useLayoutStore from "stores/layoutStore";
import useDataStore from "features/Sites/hooks/useDataStore";
import { FaDatabase } from "react-icons/fa";

import { ControlButton, StyledMapContainer } from "./styledComponents";
import AddMenuButton from "./MenuButton";

import { clusterLayer, clusterCountLayer, unclusteredPointLayer, onMapLoad } from "../lib/layers";
import {Tooltip} from "../lib/tooltip";

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
        x: event.point.x,
        y: event.point.y,
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
    console.log(event);
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
          return;
        } 
        else if (layerId === 'clusters') {
          setPopupInfo(null);
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

            <Tooltip className="hola" left={`${popupInfo.x}px`} top={`${popupInfo.y}px`}>
              <div>Site: {popupInfo.feature.properties.name}</div>
              <div>ID: {popupInfo.feature.properties.id}</div>
              <div>Type: {popupInfo.feature.properties.type}</div>
            </Tooltip>
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
