// TableComponent2.js
import React from 'react';
import GeneralTable from 'components/table/GeneralTable';
import {ViewTableColumns, ViewTableStyles} from 'features/Views/lib/table';

const ViewTable = (
	{ 
		data,
		columns = ViewTableColumns ,
		styles = ViewTableStyles
	}
) => (
	<GeneralTable
		title="Views"
		columns={columns}
		data={data}
		customStyles={styles}
		highlightOnHover
		pointerOnHover
		pagination
		selectableRows
		selectableRowsHighlight
	/>
);

export default ViewTable;