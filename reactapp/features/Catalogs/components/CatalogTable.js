// CatalogTable.js (refactored)
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import FilterComponent from 'components/table/FilterComponent';
import ViewTable from 'features/Views/components/ViewTable';
import { CatalogColumns, CatalogTableStyles } from 'features/Catalogs/lib/table';


const ExpandableViewTable = ({ data }) => {
  const { views = [] } = data || {};
  return <ViewTable data={views} />;
};

export const CatalogTable = ({
  data = [],
  columns = CatalogColumns,
  customStyles = CatalogTableStyles,
}) => {
  const [filterText, setFilterText] = React.useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

  const filteredItems = data.filter(
    (item) => item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponent = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText('');
      }
    };

    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
      />
    );
  }, [filterText, resetPaginationToggle]);

  return (
    <GeneralTable
      columns={columns}
      data={filteredItems}
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
