import React, { useEffect,useContext } from 'react';
import { useShallow } from 'zustand/react/shallow'
import Accordion from 'react-bootstrap/Accordion';
import { CatalogTable } from 'features/Catalogs/components/CatalogTable';
import ViewTable from 'features/Views/components/ViewTable';
import SiteTable from 'features/Sites/components/SiteTable';
import useCatalogStore from 'features/Catalogs/hooks/useCatalogStore';


function SitesList() {
  const sites = useCatalogStore(useShallow((state) => state.getAllSites()));
  return (
    <SiteTable data={sites}/>
  );
}

export default SitesList;