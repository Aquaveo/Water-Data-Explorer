import React, { useEffect,useContext } from 'react';
import { useShallow } from 'zustand/react/shallow'
import Accordion from 'react-bootstrap/Accordion';
import { CatalogTable } from 'features/Catalogs/components/CatalogTable';
import { AppContext } from "features/react-tethys/context/context";
import useCatalogStore from 'features/Catalogs/hooks/useCatalogStore';


function CatalogsList() {
  // const { backend } = useContext(AppContext);
  // const addCatalogs = useCatalogStore(useShallow((state) => state.addCatalogs));
  const catalogs = useCatalogStore(useShallow((state) => state.catalogs));
  
  // useEffect(() => {
  //   backend.on(backend.actions.GET_LIST_CATALOGS, addCatalogs);
  //   backend.do(backend.actions.GET_LIST_CATALOGS,{type: 'his'});
  //   return () => {
  //     backend.off(backend.actions.GET_LIST_CATALOGS);
  //   };
  // }, []);


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