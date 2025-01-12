// SiteTable.js
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import { SitesTableColumns, SitesTableStyles } from 'components/table/constants';
import FilterComponent from 'components/table/FilterComponent';

const onSiteRowClick = (row) => {
  console.log('Row clicked:', row);
};

const SiteTable = ({
  data,
  columns = SitesTableColumns,
  styles = SitesTableStyles,
}) => {
  const [filterText, setFilterText] = React.useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

  const filteredItems = data.filter((item) => {
    if (!filterText) return true;
    const text = filterText.toLowerCase();
    return item.name && item.name.toLowerCase().includes(text);
  });

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
      title="Sites"
      columns={columns}
      data={filteredItems}
      customStyles={styles}
      highlightOnHover
      pointerOnHover
      pagination
      // If you still want row selection:
      selectableRows
      selectableRowsHighlight
      // If you want to handle row selection:
      // onSelectedRowsChange={handleSelectedRows}
      // The important part:
      onRowClicked={onSiteRowClick} // <-- pass row click function
      subHeader
      subHeaderComponent={subHeaderComponent}
      paginationResetDefaultPage={resetPaginationToggle}
    />
  );
};

export default SiteTable;
