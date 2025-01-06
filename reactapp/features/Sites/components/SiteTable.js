// SiteTable.js
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import { SitesTableColumns, SitesTableStyles } from 'features/Sites/lib/table';

const SiteTable = ({ 
  data, 
  columns = SitesTableColumns, 
  styles = SitesTableStyles, 
  onSelectedRowsChange // Accept the selection handler
}) => (
  <GeneralTable
    title="Sites"
    columns={columns}
    data={data}
    customStyles={styles}
    highlightOnHover
    pointerOnHover
    pagination
    selectableRows
    selectableRowsHighlight
    onSelectedRowsChange={onSelectedRowsChange} // Pass the handler to GeneralTable
  />
);

export default SiteTable;
