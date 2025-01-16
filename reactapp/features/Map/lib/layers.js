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
  

  export { 
    clusterLayer, 
    clusterCountLayer, 
    unclusteredPointLayer, 
    onMapLoad 
};