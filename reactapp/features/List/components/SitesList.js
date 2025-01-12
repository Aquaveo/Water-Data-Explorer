import React, { useEffect,useContext } from 'react';
import { useShallow } from 'zustand/react/shallow'
import SiteTable from 'components/table/SiteTable';
import useDataStore from 'features/Sites/hooks/useDataStore';


function SitesList() {
  const sites = useDataStore(useShallow((state) => state.getAllSites()));
  return (
    <SiteTable data={sites}  />
  );
}

export default SitesList;