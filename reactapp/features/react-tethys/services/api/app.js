import apiClient from "services/api/client";

const APP_ROOT_URL = process.env.TETHYS_APP_ROOT_URL;

const appAPI = {
    addCatalog:(params) => {
        return apiClient.get(`${APP_ROOT_URL}addCatalog/`, { params });
    },
    getCatalogViewsList:(params) => {
        return apiClient.get(`${APP_ROOT_URL}get-catalog-views-list/`,{ params });
    },
}
 
export default appAPI;