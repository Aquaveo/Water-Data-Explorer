import React,{Fragment} from 'react';
import CircularButton from "components/buttons/CustomButton";
import { TbMapPinSearch } from 'react-icons/tb';
import { MdOutlineWater } from 'react-icons/md';
import hs_light from 'assets/hs2_light.png';
import useLayoutStore from "stores/useLayoutStore";


const ButtomMapMenu = ( ) => {
  const { toggleSidePanelVisibility, showSiteList, showImportCatalogMenu,showImportHydroServerMenu } = useLayoutStore();

  const handleShowSiteList = () => {
    showSiteList();
    toggleSidePanelVisibility();
  };

  const handleImportCatalog = () => {
    showImportCatalogMenu();
    toggleSidePanelVisibility();
    };
  const handleImportHydroServerSites = () => {
    showImportHydroServerMenu();
    toggleSidePanelVisibility();
  };

    return (
        <Fragment>
            <CircularButton
                icon={<TbMapPinSearch size={25} color="#333" />}
                onClick={handleShowSiteList}
                tooltipText="Show Site List"
                style={{
                    background: '#f2f2f2',
                    border: '2px solid #aaa',
                    top: '150px',
                    right: '10px',
                }}
            />
            <CircularButton
                icon={<MdOutlineWater size={25} color="#333" />}
                onClick={handleImportCatalog}
                tooltipText="Import Sites From Catalog"
                style={{
                    background: '#f2f2f2',
                    border: '2px solid #aaa',
                    top: '250px',
                    right: '10px',
                }}
            />
            <CircularButton
                imageUrl={hs_light}
                altText="Import Sites from HydroServer2"
                onClick={handleImportHydroServerSites}
                tooltipText="Import Sites from HydroServer2"
                style={{
                    backgroundColor: '#f2f2f2',
                    border: '2px solid #aaa',
                    top: '300px',
                    right: '10px',
                }}
            />
        </Fragment>
    );
};

export default ButtomMapMenu;