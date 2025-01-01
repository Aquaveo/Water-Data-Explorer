// ViewTableColumns.js
import { TbBrandDatabricks } from 'react-icons/tb';

export const ViewTableStyles = {
  headRow: { style: { border: 'none' } },
  headCells: { style: { color: '#202124', fontSize: '14px' } },
  rows: {
    highlightOnHoverStyle: {
      backgroundColor: 'rgb(230, 244, 244)',
      borderBottomColor: '#FFFFFF',
      outline: '1px solid #FFFFFF',
    },
  },
  pagination: { style: { border: 'none' } },
};

export const ViewTableColumns = [
  {
    cell: () => <TbBrandDatabricks size={20} />,
	minWidth: '50px', 
	maxWidth: '70px',
    style: {
      borderBottom: '1px solid #FFFFFF',
    },
  },
  {
    name: 'Name',
    selector: row => row.title,
    sortable: true,
	minWidth: '100px', 
	maxWidth: '150px',
    style: { color: '#202124', fontSize: '14px', fontWeight: 500 },
  },
  {
    name: 'Sites',
    selector: row => row.sitecount,
    sortable: true,
    width: '90px',
	maxWidth: '100px',
    style: { color: 'rgba(0,0,0,.54)' },
  },
  {
    name: 'Variables',
    selector: row => row.variablecount,
    sortable: true,
    width: '90px',
	maxWidth: '100px',
    style: { color: 'rgba(0,0,0,.54)' },
  },
  {
    name: 'Time Series',
    selector: row => row.valuecount,
    sortable: true,
    width: '90px',
	maxWidth: '100px',
    style: { color: 'rgba(0,0,0,.54)' },
  },
];
