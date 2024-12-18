import React from 'react';
import styled from 'styled-components';
import DataTable from 'react-data-table-component';
import CustomMenu from './CustomMenu';
import { TbSitemap,TbBrandDatabricks } from 'react-icons/tb';
import { MdClear } from "react-icons/md";

const data = [
	{
		id: 1,
		name: 'CUAHSI HIS Central',
		count: 30,
		description: 'This is the CUAHSI HIS Central catalog.'
	},
	{
		id: 2,
		name: 'HydroServer 2 (DRE)',
		count: 40,
		description: 'HydroServer 2 (DRE) catalog details...'
	},
	{
		id: 3,
		name: 'WMO Global',
		count: 10,
		description: 'WMO Global catalog details...'
	},
	{
		id: 4,
		name: 'Playground HydroServer 2',
		count: 2,
		description: 'Playground HydroServer 2 catalog details...'
	},
];

const customStyles = {
	headRow: {
		style: {
			border: 'none',
		},
	},
	headCells: {
		style: {
			color: '#202124',
			fontSize: '14px',
		},
	},
	rows: {
		highlightOnHoverStyle: {
			backgroundColor: 'rgb(230, 244, 244)',
			borderBottomColor: '#FFFFFF',
			borderRadius: '25px',
			outline: '1px solid #FFFFFF',
		},
	},
	pagination: {
		style: {
			border: 'none',
		},
	},
};

const columns = [
	{
		cell: () => <TbSitemap size={20} />,
		width: '56px', // custom width for icon button
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
		style: {
			color: '#202124',
			fontSize: '14px',
			fontWeight: 500,
		},
	},
	{
		name: 'View Count',
		selector: row => row.count,
		sortable: true,
		style: {
			color: 'rgba(0,0,0,.54)',
		},
	},
	{
		cell: row => <CustomMenu size="small" row={row} />,
		allowOverflow: true,
		button: true,
		width: '56px',
	},
];

// This component will be shown when a row is expanded
const ExpandedComponent = ({ data }) => (
  <div style={{ padding: '10px', background: '#f9f9f9' }}>
    <strong>Description:</strong> {data.description}
  </div>
);

const columns2 = [
	{
		cell: () => <TbBrandDatabricks size={20} />,
		width: '56px', // custom width for icon button
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
		style: {
			color: '#202124',
			fontSize: '14px',
			fontWeight: 500,
		},
	},
	{
		name: 'Sites',
		selector: row => row.count,
		sortable: true,
		style: {
			color: 'rgba(0,0,0,.54)',
		},
	},
	{
		cell: row => <CustomMenu size="small" row={row} />,
		allowOverflow: true,
		button: true,
		width: '56px',
	},
];


const data2 = [
	{
		id: 1,
		name: 'Keny Service View',
		count: 30,
		description: 'This is the CUAHSI HIS Central catalog.'
	},
	{
		id: 2,
		name: 'Argentina Ina Service View',
		count: 40,
		description: 'HydroServer 2 (DRE) catalog details...'
	},
	{
		id: 3,
		name: 'Paraguay Service View',
		count: 10,
		description: 'WMO Global catalog details...'
	},
	{
		id: 4,
		name: 'Brazil ANA Service View',
		count: 2,
		description: 'Playground HydroServer 2 catalog details...'
	},
];


export const TableComponent2 = () => {
	return (
		<DataTable
			title="Views"
			columns={columns2}
			data={data2}
			customStyles={customStyles}
			highlightOnHover
			pointerOnHover
			pagination
			selectableRows
			selectableRowsHighlight
		/>
	);
};


const TextField = styled.input`
	height: 32px;
	width: 200px;
	border-radius: 3px;
	border-top-left-radius: 5px;
	border-bottom-left-radius: 5px;
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;
	border: 1px solid #e5e5e5;
	padding: 0 32px 0 16px;
    background-color: #e5e5e5 ;
    color: #202124;
	&:hover {
		cursor: pointer;
	}
`;

const ClearButton = styled.button`
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
	border-top-right-radius: 5px;
	border-bottom-right-radius: 5px;
	height: 34px;
	width: 32px;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
    background-color: #202124 ;
`;

const FilterComponent = ({ filterText, onFilter, onClear }) => (
	<>
		<TextField
			id="search"
			type="text"
			placeholder="Search"
			aria-label="Search Input"
			value={filterText}
			onChange={onFilter}
		/>
		<ClearButton type="button" onClick={onClear}>
            <MdClear size={20}/>
		</ClearButton>
	</>
);

export const TableComponent = () => {
	const [filterText, setFilterText] = React.useState('');
	const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false);

	const filteredItems = data.filter(
		item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
	);

	const subHeaderComponentMemo = React.useMemo(() => {
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
		<DataTable
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
			expandableRowsComponent={TableComponent2}
			subHeader
			subHeaderComponent={subHeaderComponentMemo}
			paginationResetDefaultPage={resetPaginationToggle}
		/>
	);
};
