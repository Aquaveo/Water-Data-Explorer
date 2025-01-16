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
  
  
const badgeColors = ['primary', 'secondary', 'info', 'warning', 'danger'];

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
    selector: (row) => row.name,
    sortable: true,
    minWidth: '100px',
    maxWidth: '150px',
    style: { color: '#202124', fontSize: '14px', fontWeight: 500 },
  },
  {
    name: 'Type',
    selector: (row) => row.type,
    sortable: true,
    width: '90px',
    maxWidth: '100px',
    style: { color: 'rgba(0,0,0,.54)' },
  },
  {
    name: 'Country',
    selector: (row) => row.country,
    sortable: true,
    width: '90px',
    maxWidth: '100px',
    style: { color: 'rgba(0,0,0,.54)' },
  },
  {
    name: 'Tags',
    // Use `cell` instead of `selector` so we can return JSX
    cell: (row) => {
      if (!row.tags || row.tags.length === 0) {
        return null;
      }
      return (
        <div>
          {row.tags.map((tag, index) => {
            // pick a color in some fashion
            const color = badgeColors[index % badgeColors.length];
            return (
              <span key={index} className={`badge bg-${color} me-1`}>
                {tag}
              </span>
            );
          })}
        </div>
      );
    },
    sortable: true,
    // optional width settings
    minWidth: '120px',
    maxWidth: '200px',
  },
];



export const DetailedSiteRowColumns= [
  {
    name: 'Attribute',
    selector: (row) => row.attribute,
    sortable: true,
    minWidth: '100px',
    maxWidth: '150px',
    style: { color: '#202124', fontSize: '14px', fontWeight: 500 },
  },
  {
    name: 'Value',
    selector: (row) => row.value,
    sortable: true,
    width: '90px',
    maxWidth: '100px',
    style: { color: 'rgba(0,0,0,.54)' },
  }
];
