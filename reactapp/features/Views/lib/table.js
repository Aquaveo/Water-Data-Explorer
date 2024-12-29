
import { TbBrandDatabricks } from 'react-icons/tb';


export const ViewTableStyles = {
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



export const ViewTableColumns = [
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
		selector: row => row.Title,
		sortable: true,
		grow: 2,
		style: { color: '#202124', fontSize: '14px', fontWeight: 500 },
	},
	{
		name: 'Sites',
		selector: row => row.sitecount,
		sortable: true,
		style: { color: 'rgba(0,0,0,.54)' },
	},
	{
		name: 'Variables',
		selector: row => row.variablecount,
		sortable: true,
		style: { color: 'rgba(0,0,0,.54)' },
	},
	{
		name: 'Time Series',
		selector: row => row.valuecount,
		sortable: true,
		style: { color: 'rgba(0,0,0,.54)' },
	},
];