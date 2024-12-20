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

const data3 = [
	{
		"id": 1,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(argentina-ina))/cuahsi_1_1.asmx",
		"Title": "Argentina, Instituto Nacional del Agua (INA)",
		"valuecount": "14356052",
		"sitecount": "930",
		"variablecount": "28"
	},
	{
		"id": 2,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(brazil-ana))/cuahsi_1_1.asmx",
		"Title": "Brazil, Agência Nacional de Águas (ANA)",
		"valuecount": "435465560",
		"sitecount": "3290",
		"variablecount": "3"
	},
	{
		"id": 3,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(brazil-inmet))/cuahsi_1_1.asmx",
		"Title": "Brazil, Instituto Nacional de Meteorologia (INMET)",
		"valuecount": "58213",
		"sitecount": "3772",
		"variablecount": "69"
	},
	{
		"id": 4,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(brazil-ana-sar))/cuahsi_1_1.asmx",
		"Title": "Brazil, SAR - Agência Nacional de Águas (ANA)",
		"valuecount": "100",
		"sitecount": "703",
		"variablecount": "65"
	},
	{
		"id": 5,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(canada-cehq))/cuahsi_1_1.asmx",
		"Title": "Canada, Centre d'expertise hydrique du Québec (CEHQ)",
		"valuecount": "100",
		"sitecount": "332",
		"variablecount": "2"
	},
	{
		"id": 6,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(ftpCanada))/cuahsi_1_1.asmx",
		"Title": "Canada, Water Survey of Canada",
		"valuecount": "35033155",
		"sitecount": "2089",
		"variablecount": "4"
	},
	{
		"id": 7,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(dom-indrhi))/cuahsi_1_1.asmx",
		"Title": "Dominican Republic, INDRHI",
		"valuecount": "1012",
		"sitecount": "241",
		"variablecount": "3"
	},
	{
		"id": 8,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(onametStations))/cuahsi_1_1.asmx",
		"Title": "Dominican Republic, Oficina Nacional de Meteorologia (ONAMET)",
		"valuecount": "100",
		"sitecount": "13",
		"variablecount": "6"
	},
	{
		"id": 9,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(syke))/cuahsi_1_1.asmx",
		"Title": "Finland, Finnish Environment Insitute (SYKE)",
		"valuecount": "118659375",
		"sitecount": "2274",
		"variablecount": "10"
	},
	{
		"id": 10,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(igracsos))/cuahsi_1_1.asmx",
		"Title": "IGRAC",
		"valuecount": "235935",
		"sitecount": "219039",
		"variablecount": "21"
	},
	{
		"id": 11,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(iceland-imo))/cuahsi_1_1.asmx",
		"Title": "Iceland, Iceland Meteorological Office",
		"valuecount": "26897",
		"sitecount": "19",
		"variablecount": "2"
	},
	{
		"id": 12,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(UUID-a4002f3f-862b-411c-b617-71349b711742))/cuahsi_1_1.asmx",
		"Title": "Italy, Italian Institute for Environmental Protection and Research (ISPRA) - Monitoring Network",
		"valuecount": "73151330",
		"sitecount": "4996",
		"variablecount": "84"
	},
	{
		"id": 13,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(nz-niwa))/cuahsi_1_1.asmx",
		"Title": "New Zealand, National Institute of Water and Atmospheric Research",
		"valuecount": "100",
		"sitecount": "113",
		"variablecount": "43"
	},
	{
		"id": 14,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(norway-nve-hydro))/cuahsi_1_1.asmx",
		"Title": "Norway, Norwegian Water Resources and Energy Directorate",
		"valuecount": "81332596",
		"sitecount": "440",
		"variablecount": "78"
	},
	{
		"id": 15,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(paraguay-dmh))/cuahsi_1_1.asmx",
		"Title": "Paraguay, Dirección de Meteorología e Hidrología (DMH)",
		"valuecount": "333",
		"sitecount": "51",
		"variablecount": "17"
	},
	{
		"id": 16,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(pry-dmh-sigedac))/cuahsi_1_1.asmx",
		"Title": "Paraguay, Dirección de Meteorología e Hidrología (DMH), SIGEDAC",
		"valuecount": "917",
		"sitecount": "24",
		"variablecount": "31"
	},
	{
		"id": 17,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(pry-dmh-automatic))/cuahsi_1_1.asmx",
		"Title": "Paraguay, Dirección de Meteorología e Hidrología (DMH), Sistema Automaticas",
		"valuecount": "1058",
		"sitecount": "79",
		"variablecount": "24"
	},
	{
		"id": 18,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(russia-rihmi-wdc))/cuahsi_1_1.asmx",
		"Title": "Russian Federation, Federal Service for Hydrometeorology and Environmental Monitoring (Roshydromet)",
		"valuecount": "100",
		"sitecount": "57",
		"variablecount": "1"
	},
	{
		"id": 19,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(savahis))/cuahsi_1_1.asmx",
		"Title": "Sava River Basin, Sava Hydrological Information System (SavaHIS)",
		"valuecount": "283687625",
		"sitecount": "513",
		"variablecount": "41"
	},
	{
		"id": 20,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(uk-nrfa))/cuahsi_1_1.asmx",
		"Title": "United Kingdom, National River Flow Archive (NRFA)",
		"valuecount": "13550",
		"sitecount": "1600",
		"variablecount": "13"
	},
	{
		"id": 21,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(usgswatersrv))/cuahsi_1_1.asmx",
		"Title": "United States of America, U.S. Geological Survey (USGS)",
		"valuecount": "465526511",
		"sitecount": "31052",
		"variablecount": "9"
	},
	{
		"id": 22,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(uruguay-dinagua))/cuahsi_1_1.asmx",
		"Title": "Uruguay, Dirección Nacional de Aguas (DINAGUA)",
		"valuecount": "1182",
		"sitecount": "213",
		"variablecount": "17"
	},
	{
		"id": 23,
		"servURL": "https://whos.geodab.eu/gs-service/services/essi/token/whos-60f68787-6a92-4d4e-95e2-08aee08cb239/view/gs-view-and(whos,gs-view-source(uruguay-inumet))/cuahsi_1_1.asmx",
		"Title": "Uruguay, Instituto Uruguayo de Meteorología (INUMET)",
		"valuecount": "145",
		"sitecount": "145",
		"variablecount": "1"
	}
]


const ViewTable = (
	{ 
		data=data3,
		columns=columns2,
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