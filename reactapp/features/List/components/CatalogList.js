import React, { useEffect,useContext } from 'react';
import { useShallow } from 'zustand/react/shallow'
import Accordion from 'react-bootstrap/Accordion';
import { CatalogTable } from 'features/Catalogs/components/CatalogTable';
import useCatalogStore from 'features/Catalogs/hooks/useCatalogStore';


function CatalogsList() {
  const catalogs = useCatalogStore(useShallow((state) => state.catalogs));
  
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