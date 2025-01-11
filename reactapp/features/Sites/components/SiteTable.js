// SiteTable.js
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import { SitesTableColumns, SitesTableStyles } from 'features/Sites/lib/table';
import FilterComponent from 'components/table/FilterComponent';


const SiteTable = ({ 
  data, 
  columns = SitesTableColumns, 
  styles = SitesTableStyles, 
  onSelectedRowsChange // Accept the selection handler
}) =>{

  const [filterText, setFilterText] = React.useState('');
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

  const filteredItems = data.filter(
    (item) => item.title && item.title.toLowerCase().includes(filterText.toLowerCase())
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

    return(
      <GeneralTable
        title="Sites"
        columns={columns}
        data={filteredItems}
        customStyles={styles}
        highlightOnHover
        pointerOnHover
        pagination
        selectableRows
        selectableRowsHighlight
        onSelectedRowsChange={onSelectedRowsChange} // Pass the handler to GeneralTable
        subHeader
        subHeaderComponent={subHeaderComponent}
        paginationResetDefaultPage={resetPaginationToggle}
      />
    );

}




export default SiteTable;
