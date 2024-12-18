// TableComponent.js
import React from 'react';
import { TbSitemap } from 'react-icons/tb';
import CustomMenu from 'components/table/CustomMenu';
import GeneralTable from 'components/table/GeneralTable';
import FilterComponent from 'components/table/FilterComponent';
import ViewTable from 'features/Views/components/ViewTable'; // used as expanded component

const data = [
	{ id: 1, name: 'CUAHSI HIS Central', count: 30, description: 'CUAHSI HIS Central catalog.' },
	{ id: 2, name: 'HydroServer 2 (DRE)', count: 40, description: 'HydroServer 2 (DRE) details...' },
	{ id: 3, name: 'WMO Global', count: 10, description: 'WMO Global catalog details...' },
	{ id: 4, name: 'Playground HydroServer 2', count: 2, description: 'Playground HydroServer 2 details...' },
];

const customStyles = {
	headRow: { style: { border: 'none' } },
	headCells: { style: { color: '#202124', fontSize: '14px' } },
	rows: {
		highlightOnHoverStyle: {
			backgroundColor: 'rgb(230, 244, 244)',
			borderBottomColor: '#FFFFFF',
			borderRadius: '25px',
			outline: '1px solid #FFFFFF',
		},
	},
	pagination: { style: { border: 'none' } },
};

const columns = [
	{
		cell: () => <TbSitemap size={20} />,
		width: '56px',
		style: {
			borderBottom: '1px solid #FFFFFF',
			marginBottom: '-1px',
		},
	},
	{
		name: 'Name',
		selector: row => row.name,
		sortable: true,
		grow: 2,
		style: { color: '#202124', fontSize: '14px', fontWeight: 500 },
	},
	{
		name: 'View Count',
		selector: row => row.count,
		sortable: true,
		style: { color: 'rgba(0,0,0,.54)' },
	},
	{
		cell: row => <CustomMenu size="small" row={row} />,
		allowOverflow: true,
		button: true,
		width: '56px',
	},
];

export const CatalogTable = () => {
	const [filterText, setFilterText] = React.useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

	const filteredItems = data.filter(
		item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
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
				onFilter={e => setFilterText(e.target.value)}
				onClear={handleClear}
				filterText={filterText}
			/>
		);
	}, [filterText, resetPaginationToggle]);

	return (
		<GeneralTable
			title="Catalog List"
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
			expandableRowsComponent={ViewTable}
			subHeader
			subHeaderComponent={subHeaderComponent}
			paginationResetDefaultPage={resetPaginationToggle}
		/>
	);
};
