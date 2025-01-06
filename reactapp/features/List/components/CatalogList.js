import React, { useEffect,useContext } from 'react';
import { useShallow } from 'zustand/react/shallow'
import Accordion from 'react-bootstrap/Accordion';
import { CatalogTable } from 'features/Catalogs/components/CatalogTable';
import ViewTable from 'features/Views/components/ViewTable';
import SiteTable from 'features/Sites/components/SiteTable';
import useCatalogStore from 'features/Catalogs/hooks/useCatalogStore';


function CatalogsList() {
  const catalogs = useCatalogStore(useShallow((state) => state.catalogs));
  
  const views = useCatalogStore(useShallow((state) => state.getAllViews()));
  const sites = useCatalogStore(useShallow((state) => state.getAllSites()));
  return (
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>CUAHSI WOF HIS Central Catalog</Accordion.Header>
        <Accordion.Body>
          <CatalogTable data={catalogs} />
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Services</Accordion.Header>
        <Accordion.Body>
        <ViewTable data={views}/>
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>Sites</Accordion.Header>
        <Accordion.Body>
          <SiteTable data={sites}/>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

export default CatalogsList;