import React,{Fragment} from 'react';
import CircularButton from "components/buttons/CustomButton";
import { TbMapPinSearch } from 'react-icons/tb';
import { MdOutlineWater } from 'react-icons/md';
import hs_light from 'assets/hs2_light.png';


const ButtomMapMenu = ({ handleShowSiteList, showImportCatalogMenu }) => {
    return (
        <Fragment>
            <CircularButton
                icon={<TbMapPinSearch size={25} color="#333" />}
                onClick={handleShowSiteList}
                tooltipText="Show Site List"
                style={{
                    background: '#f0f0f0',
                    border: '2px solid #aaa',
                    top: '150px',
                    right: '10px',
                }}
            />
            <CircularButton
                icon={<MdOutlineWater size={25} color="#333" />}
                onClick={showImportCatalogMenu}
                tooltipText="Import Sites From Catalog"
                style={{
                    background: '#f0f0f0',
                    border: '2px solid #aaa',
                    top: '250px',
                    right: '10px',
                }}
            />
            <CircularButton
                imageUrl={hs_light}
                altText="Import Sites from HydroServer2"
                onClick={() => alert('Image button clicked!')}
                tooltipText="Import Sites from HydroServer2"
                style={{
                    backgroundColor: '#f2f2f2',
                    border: '2px solid #888',
                    top: '300px',
                    right: '10px',
                }}
            />
        </Fragment>
    );
};

export default ButtomMapMenu;