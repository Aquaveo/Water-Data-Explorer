// GeneralTable.js
import React from 'react';
import DataTable from 'react-data-table-component';

const GeneralTable = ({
  title,
  columns,
  data,
  customStyles,
  highlightOnHover = false,
  pointerOnHover = false,
  pagination = false,
  paginationPerPage = 50,
  selectableRows = false,
  selectableRowsHighlight = false,
  expandableRows = false,
  expandOnRowClicked = false,
  expandableRowsHideExpander = false,
  expandableRowsComponent = null,
  subHeader = false,
  subHeaderComponent = null,
  paginationResetDefaultPage = false,
  onSelectedRowsChange, // for checkbox selection events
  onRowClicked, // <-- new prop for handling row clicks
}) => (
  <DataTable
    title={title}
    columns={columns}
    data={data}
    customStyles={customStyles}
    highlightOnHover={highlightOnHover}
    pointerOnHover={pointerOnHover}
    pagination={pagination}
    paginationPerPage={paginationPerPage}
    selectableRows={selectableRows}
    selectableRowsHighlight={selectableRowsHighlight}
    onSelectedRowsChange={onSelectedRowsChange} // for row selection
    onRowClicked={onRowClicked} // <-- pass it to DataTable
    expandableRows={expandableRows}
    expandOnRowClicked={expandOnRowClicked}
    expandableRowsHideExpander={expandableRowsHideExpander}
    expandableRowsComponent={expandableRowsComponent}
    subHeader={subHeader}
    subHeaderComponent={subHeaderComponent}
    paginationResetDefaultPage={paginationResetDefaultPage}
  />
);

export default GeneralTable;
