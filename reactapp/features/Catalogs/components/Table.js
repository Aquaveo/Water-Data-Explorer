import React from 'react';
import DataTable from 'react-data-table-component';
import CustomMenu from './CustomMenu';
import { TbSitemap } from "react-icons/tb";

const data = [
	{
		id: 1,
		name: 'CUAHSI HIS Central',
		count: 30
	},
	{
		id: 2,
		name: 'HydroServer 2 (DRE)',
		count: 40
	},
	{
		id: 3,
		name: 'WMO Global',
		count: 10
	},
	{
		id: 4,
		name: 'Playground HydroServer 2',
		count: 2
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

export const TableComponent = () => (
	<DataTable
		columns={columns}
		data={data}
		customStyles={customStyles}
		highlightOnHover
		pointerOnHover
	/>
);
