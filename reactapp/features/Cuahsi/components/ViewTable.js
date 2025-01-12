// ViewTable.js
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import { ViewTableColumns, ViewTableStyles } from 'components/table/constants';

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
    paginationPerPage={10}
    selectableRows
    selectableRowsHighlight
    onSelectedRowsChange={onSelectedRowsChange} // Pass the handler to GeneralTable
  />
);

export default ViewTable;
