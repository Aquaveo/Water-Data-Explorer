import Map from '@planet/maps/Map';
import OSM from '@planet/maps/source/OSM';
import ScaleLine from '@planet/maps/control/ScaleLine';
import View from '@planet/maps/View';
import TileLayer from '@planet/maps/layer/WebGLTile';
import 'ol/ol.css'; // optional, for styling


const MapComponent = () => {
  return (
    <Map style={{width: '100%', height: '100%'}}>
      <View options={{center: [0, 0], zoom: 1}} />
      <TileLayer>
        <OSM />
      </TileLayer>
      <ScaleLine />
    </Map>
  );
}
export default MapComponent;