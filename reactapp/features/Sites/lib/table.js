// ViewTableColumns.js
import { TbBrandDatabricks } from 'react-icons/tb';

export const SitesTableStyles = {
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


export const SitesTableColumns = [
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
    name: 'Countries',
    selector: row => row.countries,
    sortable: true,
    width: '90px',
	  maxWidth: '100px',
    style: { color: 'rgba(0,0,0,.54)' },
  },
  {
    name: 'Elevation',
    selector: row => row.elevation,
    sortable: true,
    width: '90px',
	  maxWidth: '100px',
    style: { color: 'rgba(0,0,0,.54)' },
  },
  {
    name: 'tags',
    selector: row => row.tags,
    sortable: true,
    width: '90px',
	  maxWidth: '100px',
    style: { color: 'rgba(0,0,0,.54)' },
  },
];
