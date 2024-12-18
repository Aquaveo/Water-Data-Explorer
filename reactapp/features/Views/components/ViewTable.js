// TableComponent2.js
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import CustomMenu from 'components/table/CustomMenu';
import { TbBrandDatabricks } from 'react-icons/tb';

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

const columns2 = [
	{
		cell: () => <TbBrandDatabricks size={20} />,
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
		name: 'Sites',
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

const data2 = [
	{ id: 1, name: 'Keny Service View', count: 30, description: 'CUAHSI HIS Central catalog.' },
	{ id: 2, name: 'Argentina Ina Service View', count: 40, description: 'HydroServer 2 (DRE) details...' },
	{ id: 3, name: 'Paraguay Service View', count: 10, description: 'WMO Global catalog details...' },
	{ id: 4, name: 'Brazil ANA Service View', count: 2, description: 'Playground HydroServer details...' },
];

const ViewTable = () => (
	<GeneralTable
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

export default ViewTable;