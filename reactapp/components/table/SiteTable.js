// SiteTable.js
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import { SitesTableColumns, SitesTableStyles } from 'components/table/constants';
import FilterComponent from 'components/table/FilterComponent';


const oncClickSiteRow = (row) => {
  console.log(row);
}

const SiteTable = ({ 
  data, 
  columns = SitesTableColumns, 
  styles = SitesTableStyles, 
  onSelectedRowsChange = {oncClickSiteRow}
}) =>{

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
        onSelectedRowsChange={onSelectedRowsChange}
        subHeader
        subHeaderComponent={subHeaderComponent}
        paginationResetDefaultPage={resetPaginationToggle}
      />
    );

}




export default SiteTable;
