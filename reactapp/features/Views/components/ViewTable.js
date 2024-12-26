// TableComponent2.js
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';


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




const ViewTable = (
	{ 
		data,
		columns
	}
) => (
	<GeneralTable
		title="Views"
		columns={columns}
		data={data}
		customStyles={customStyles}
		highlightOnHover
		pointerOnHover
		pagination
		selectableRows
		selectableRowsHighlight
	/>
);

export default ViewTable;