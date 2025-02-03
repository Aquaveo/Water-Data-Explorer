import React, { useRef, useCallback, useState, useContext, useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { point as turfPoint } from "@turf/helpers";
import buffer from "@turf/buffer";
import bbox from "@turf/bbox";
import useTheme from "hooks/useTheme";
import useDataStore from "features/Sites/hooks/useDataStore";
import { StyledMapContainer } from "./styledComponents";
import { clusterLayer, clusterCountLayer, unclusteredPointLayer, bufferLayer, onMapLoad } from "../lib/layers";
import { Tooltip } from "../lib/tooltip";
import { AppContext } from "features/react-tethys/context/context";
import ButtomMapMenu from "./ButtomMenu";

const MapComponent = ({ showLoadingToast }) => {
  const { backend } = useContext(AppContext);
  const theme = useTheme();
  
  const filteredSites = useDataStore((state) => state.filteredSites);
  const setCurrentSite = useDataStore((state) => state.setCurrentSite);
  // Subscribe to the current site:
  const currentSite = useDataStore((state) => state.current_site);

  const [popupInfo, setPopupInfo] = useState(null);
  const [bufferData, setBufferData] = useState(null); // State for buffer GeoJSON
  const mapRef = useRef(null);

  const geojsonData = {
    type: "FeatureCollection",
    features: filteredSites
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
      features && features.find((feature) => feature.layer.id === "unclustered-point");

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

  const handleMapClick = (event) => {
    const map = mapRef.current.getMap();
    const features = map.queryRenderedFeatures(event.point, {
      layers: ["unclustered-point", "clusters"],
    });
  
    if (features.length > 0) {
      for (const feature of features) {
        const layerId = feature.layer.id;
        if (layerId === "unclustered-point") {
          const { geometry, properties } = feature;  
          const center = turfPoint(geometry.coordinates);
          const radius = 0.5; // Radius in kilometers
          const options = { units: "kilometers" };
          const circle = buffer(center, radius, options);
  
          setBufferData(circle);
  
          const bounds = bbox(circle);
          map.fitBounds(bounds, {
            padding: 20,
            duration: 1000,
          });
          
          backend.do(backend.actions.GET_SITE_INFO, { ...properties });
          showLoadingToast();
          setCurrentSite(properties);
          return;
        } else if (layerId === "clusters") {
          const clusterId = feature.properties.cluster_id;
          map.getSource("sites").getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.easeTo({
              center: feature.geometry.coordinates,
              zoom,
              duration: 1000,
            });
          });
          return;
        }
      }
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    if (!geojsonData.features.length) return;

    const map = mapRef.current.getMap();

    const [minX, minY, maxX, maxY] = bbox(geojsonData);
    map.fitBounds(
      [
        [minX, minY],
        [maxX, maxY],
      ],
      { padding: 50, duration: 1000 }
    );
  }, [geojsonData]);

  
  useEffect(() => {
    if (
      currentSite &&
      currentSite.latitude != null &&
      currentSite.longitude != null &&
      mapRef.current
    ) {
      const map = mapRef.current.getMap();
      map.easeTo({
        center: [currentSite.longitude, currentSite.latitude],
        zoom: 12, // Adjust this zoom level as desired.
        duration: 5000,
      });
    }
  }, [currentSite]);

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
        {bufferData && (
          <Source id="buffer" type="geojson" data={bufferData}>
            <Layer {...bufferLayer} />
          </Source>
        )}
        {popupInfo && (
          <Tooltip left={`${popupInfo.x}px`} top={`${popupInfo.y}px`}>
            <div>Site: {popupInfo.feature.properties.name}</div>
            <div>ID: {popupInfo.feature.properties.id}</div>
            <div>Type: {popupInfo.feature.properties.type}</div>
          </Tooltip>
        )}
      </Map>
      <ButtomMapMenu />
    </StyledMapContainer>
  );
};

export default MapComponent;
