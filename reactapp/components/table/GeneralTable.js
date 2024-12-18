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
  selectableRows = false,
  selectableRowsHighlight = false,
  expandableRows = false,
  expandOnRowClicked = false,
  expandableRowsHideExpander = false,
  expandableRowsComponent = null,
  subHeader = false,
  subHeaderComponent = null,
  paginationResetDefaultPage = false,
}) => (
  <DataTable
    title={title}
    columns={columns}
    data={data}
    customStyles={customStyles}
    highlightOnHover={highlightOnHover}
    pointerOnHover={pointerOnHover}
    pagination={pagination}
    selectableRows={selectableRows}
    selectableRowsHighlight={selectableRowsHighlight}
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
