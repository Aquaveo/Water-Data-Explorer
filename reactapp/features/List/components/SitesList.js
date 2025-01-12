import React, { useEffect,useContext } from 'react';
import { useShallow } from 'zustand/react/shallow'
import Accordion from 'react-bootstrap/Accordion';
import { CatalogTable } from 'features/Cuahsi/components/CatalogTable';
import ViewTable from 'features/Cuahsi/components/ViewTable';
import SiteTable from 'components/table/SiteTable';
import useCatalogStore from 'features/Sites/hooks/useDataStore';


function SitesList() {
  const sites = useCatalogStore(useShallow((state) => state.getAllSites()));
  return (
    <SiteTable data={sites}/>
  );
}

export default SitesList;