// CatalogTable.js (refactored)
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import ViewTable from 'features/Cuahsi/components/tables/ViewTable';
import { CatalogColumns, CatalogTableStyles } from 'features/Cuahsi/lib/table';

const ExpandableViewTable = ({ data }) => {
  const { views = [] } = data || {};
  return <ViewTable data={views} />;
};

export const CatalogTable = ({
  data = [],
  columns = CatalogColumns,
  customStyles = CatalogTableStyles,
}) => {
  

  return (
    <GeneralTable
      columns={columns}
      data={data}
      customStyles={customStyles}
      highlightOnHover
      pointerOnHover
      pagination
      selectableRows
      selectableRowsHighlight
      expandableRows
      expandOnRowClicked
      expandableRowsHideExpander
      expandableRowsComponent={ExpandableViewTable}
      subHeader
      subHeaderComponent={subHeaderComponent}
      paginationResetDefaultPage={resetPaginationToggle}
    />
  );
};
