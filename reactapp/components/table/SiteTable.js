import React from "react";
import GeneralTable from "components/table/GeneralTable";
import { SitesTableColumns, SitesTableStyles } from "components/table/constants";
import FilterComponent from "components/table/FilterComponent";
import { DetailedSiteRow } from "components/table/DetailedSiteRow";
import useDataStore from "features/Sites/hooks/useDataStore";


const onSiteRowClick = (row) => {
  console.log("Row clicked:", row);
};

const SiteTable = ({
  data,
  columns = SitesTableColumns,
  styles = SitesTableStyles,
}) => {
  const [filterText, setFilterText] = React.useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);
  const setFilteredSites = useDataStore((state) => state.setFilteredSites);

  // Enhanced filtering logic
  // Enhanced filtering logic
  const filteredItems = React.useMemo(() => {
    const text = filterText.toLowerCase();
    const filtered = data.filter((item) => {
      if (!filterText) return true;

      // Check all relevant fields
      const nameMatch = item.name?.toLowerCase().includes(text);
      const countryMatch = item.country?.toLowerCase().includes(text);
      const typeMatch = item.type?.toLowerCase().includes(text);
      const tagsMatch = item.tags?.some((tag) => tag.toLowerCase().includes(text));

      return nameMatch || countryMatch || typeMatch || tagsMatch;
    });

    setFilteredSites(filtered); // Update the filtered sites in the store
    return filtered;
  }, [data, filterText, setFilteredSites]);

  // Filter component with enhanced functionality
  const subHeaderComponent = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
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
      title=""
      columns={columns}
      data={filteredItems}
      customStyles={styles}
      highlightOnHover
      pointerOnHover
      pagination
      selectableRows
      selectableRowsHighlight
      onRowClicked={onSiteRowClick}
      subHeader
      subHeaderComponent={subHeaderComponent}
      paginationResetDefaultPage={resetPaginationToggle}
      expandableRows
      expandableRowsComponent={DetailedSiteRow}
    />
  );
};

export default SiteTable;
