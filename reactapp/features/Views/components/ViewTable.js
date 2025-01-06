// ViewTable.js
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import { ViewTableColumns, ViewTableStyles } from 'features/Views/lib/table';

const ViewTable = ({ 
  data, 
  columns = ViewTableColumns, 
  styles = ViewTableStyles, 
  onSelectedRowsChange // Accept the selection handler
}) => (
  <GeneralTable
    title="Views"
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

export default ViewTable;
