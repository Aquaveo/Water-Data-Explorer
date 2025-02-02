import React, { useEffect,useContext } from 'react';
import { useShallow } from 'zustand/react/shallow'
import SiteTable from 'features/Sites/components/SiteTable';
import useDataStore from 'features/Sites/hooks/useDataStore';



function SitesList() {
  const sites = useDataStore(useShallow((state) => state.sites));
  const setCurrentSite = useDataStore((state) => state.setCurrentSite);
  const onRowClick = (row) => {
    console.log("Row clicked:", row);

    setCurrentSite(row);
  }
  return (
    <SiteTable data={sites} onRowClicked={onRowClick} />
  );
}

export default SitesList;