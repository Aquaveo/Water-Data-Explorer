import React, { useRef, useEffect, useState } from "react";
import Map, { Source, Layer, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import useTheme from "hooks/useTheme";
import useLayoutStore from "stores/layoutStore";
import useDataStore from 'features/Sites/hooks/useDataStore';
import { FaDatabase } from "react-icons/fa";

import { ControlButton, StyledMapContainer } from "./styledComponents";
import AddMenuButton from "./MenuButton";
import maplibregl from 'maplibre-gl';
import Table from 'react-bootstrap/Table';



const onMapLoad = (event) => {
  const map = event.target;
  const hoverLayers = ['unclustered-point', 'clusters'];

  hoverLayers.forEach((layer) => {
    // Change cursor to pointer on mouse enter
    map.on('mouseenter', layer, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Revert cursor to default on mouse leave
    map.on('mouseleave', layer, () => {
      map.getCanvas().style.cursor = '';
    });
  });
};


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
    "text-color": "white", // Primary color for text
  },
};

const unclusteredPointLayer = {
  id: "unclustered-point",
  type: "circle",
  source: "sites",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#ACE894", // Success color for unclustered points
    "circle-radius": 8,
    "circle-stroke-width": 2,
    "circle-stroke-color": "white", // Primary color for stroke
  },
};


const MapComponent = () => {
  const theme = useTheme();
  const { toggleSidePanelVisibility, showSiteList, isSidePanelVisible } = useLayoutStore();
  const sites = useDataStore((state) => state.getAllSites());

  const [popupInfo, setPopupInfo] = useState(null);
  const mapRef = useRef(null);

  const geojsonData = {
    type: "FeatureCollection",
    crs: { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    features: sites.map((site) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [site.longitude, site.latitude],
      },
      properties: site,
    })),
  };



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
          setPopupInfo(properties);
          return;
        } else if (layerId === 'clusters') {
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
              duration: 500
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
        interactiveLayerIds={["clusters", "unclustered-point"]}
        mapLib={maplibregl}
        onClick={handleMapClick}
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        onLoad={onMapLoad}
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
          maxWidth="500px"
          onClose={() => setPopupInfo(null)}
        >
          <div>
            <p>{popupInfo.name}</p>
            <Table striped bordered hover variant="dark">
              <tbody>
                {Object.entries(popupInfo).map(([key, value]) => (
                  <tr key={key}>
                    <td><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong></td>
                    <td>{typeof value === 'string' && value.startsWith('http') ? <a href={value} target="_blank" rel="noopener noreferrer">{value}</a> : value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
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
