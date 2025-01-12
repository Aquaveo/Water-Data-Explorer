import CustomMenu from 'components/table/CustomMenu';
import { TbSitemap, TbBrandDatabricks, TbMapPin } from 'react-icons/tb';


export const CatalogColumns = [
	{
		cell: () => <TbSitemap size={20} />,
		minWidth: '50px', 
		maxWidth: '70px',
		style: {
			borderBottom: '1px solid #FFFFFF',
		},
	},
	{
		name: 'Name',
		selector: row => row.name,
		sortable: true,
		minWidth: '100px', 
		maxWidth: '150px',
		style: { color: '#202124', fontSize: '14px', fontWeight: 500 },
	},
	{
		name: 'View Count',
		selector: row => row.count,
		sortable: true,
		width: '90px',
		maxWidth: '100px',
		style: { color: 'rgba(0,0,0,.54)' },
	},
	{
		cell: row => <CustomMenu size="small" row={row} />,
		allowOverflow: true,
		button: true,
		width: '56px',
	},
];

export const CatalogTableStyles = {
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
	  cell: () => <TbMapPin size={20} />,
		minWidth: '50px', 
		maxWidth: '70px',
		style: {
			borderBottom: '1px solid #FFFFFF',
		},
	},
	{
	  name: 'Name',
	  selector: row => row.name,
	  sortable: true,
	  minWidth: '100px', 
	  maxWidth: '150px',
	  style: { color: '#202124', fontSize: '14px', fontWeight: 500 },
	},
	{
		name: 'Type',
		selector: row => row.type,
		sortable: true,
		width: '90px',
		maxWidth: '100px',
		style: { color: 'rgba(0,0,0,.54)' },
	},
	{
	  name: 'Country',
	  selector: row => row.country,
	  sortable: true,
	  width: '90px',
	  maxWidth: '100px',
	  style: { color: 'rgba(0,0,0,.54)' },
	}
	// {
	//   name: 'Elevation',
	//   selector: row => row.elevation,
	//   sortable: true,
	//   width: '90px',
	// 	maxWidth: '100px',
	//   style: { color: 'rgba(0,0,0,.54)' },
	// },
	// {
	//   name: 'tags',
	//   selector: row => row.tags,
	//   sortable: true,
	//   width: '90px',
	//   maxWidth: '100px',
	//   style: { color: 'rgba(0,0,0,.54)' },
	// },
];