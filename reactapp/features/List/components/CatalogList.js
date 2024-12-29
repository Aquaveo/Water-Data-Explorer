import React, { useEffect,useContext } from 'react';
import { useShallow } from 'zustand/react/shallow'
import Accordion from 'react-bootstrap/Accordion';
import { CatalogTable } from 'features/Catalogs/components/CatalogTable';
import { AppContext } from "features/react-tethys/context/context";
import useCatalogStore from 'features/Catalogs/hooks/useCatalogStore';


function CatalogsList() {
  console.log('CatalogsList');
  const { backend } = useContext(AppContext);
  const { addCatalogs } = useCatalogStore();
  const catalogs = useCatalogStore((state) => state.catalogs);
  
  // const [catalogs, addCatalogs] = useCatalogStore((state) => [
  //   state.catalogs,
  //   state.addCatalogs
  // ]);

  useEffect(() => {
    backend.on(backend.actions.GET_LIST_CATALOGS, addCatalogs);
    backend.do(backend.actions.GET_LIST_CATALOGS,{type: 'his'});
    return () => {
      console.log('CatalogsList useEffect cleanup');
      backend.off(backend.actions.GET_LIST_CATALOGS);
    };
  }, []);


  return (
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Catalogs</Accordion.Header>
        <Accordion.Body>
          {
            catalogs.length === 0 ? (
              <div>No catalogs found</div>
            ) : <CatalogTable data={catalogs} />
          }
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Views</Accordion.Header>
        <Accordion.Body>
        {/* <CatalogTable /> */}
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>Sites</Accordion.Header>
        <Accordion.Body>
        {/* <CatalogTable /> */}
        </Accordion.Body>
      </Accordion.Item>

    </Accordion>
  );
}

export default CatalogsList;