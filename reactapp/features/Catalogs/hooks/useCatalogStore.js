// useCatalogStore.js
import { create } from 'zustand';

const useCatalogStore = create((set, get) => ({
  // ----- STATE -----
  catalogs: [],  // array of catalogs

  // ----- ACTIONS -----

  // 1. Catalog-level actions
  addCatalog: (catalog) =>
    set((state) => ({
      catalogs: [...state.catalogs, catalog],
    })),

  deleteCatalog: (catalogName) =>
    set((state) => ({
      catalogs: state.catalogs.filter((cat) => cat.name !== catalogName),
    })),

  addView: (catalogName, newView) =>
    set((state) => {
      // find the catalog
      const updatedCatalogs = state.catalogs.map((cat) => {
        if (cat.name === catalogName) {
          // push the newView to the views array
          return {
            ...cat,
            views: [...cat.views, newView],
          };
        }
        return cat;
      });
      return { catalogs: updatedCatalogs };
    }),

  deleteView: (catalogName, viewName) =>
    set((state) => {
      const updatedCatalogs = state.catalogs.map((cat) => {
        if (cat.name === catalogName) {
          return {
            ...cat,
            views: cat.views.filter((v) => v.name !== viewName),
          };
        }
        return cat;
      });
      return { catalogs: updatedCatalogs };
    }),

  // 2. View-level actions
  addSites: (catalogName, viewName, newSites) =>
    set((state) => {
      const updatedCatalogs = state.catalogs.map((cat) => {
        if (cat.name === catalogName) {
          const updatedViews = cat.views.map((v) => {
            if (v.name === viewName) {
              return {
                ...v,
                sites: [...v.sites, ...newSites],
              };
            }
            return v;
          });
          return {
            ...cat,
            views: updatedViews,
          };
        }
        return cat;
      });
      return { catalogs: updatedCatalogs };
    }),

  deleteSites: (catalogName, viewName, siteIDs) =>
    set((state) => {
      const updatedCatalogs = state.catalogs.map((cat) => {
        if (cat.name === catalogName) {
          const updatedViews = cat.views.map((v) => {
            if (v.name === viewName) {
              return {
                ...v,
                sites: v.sites.filter((site) => !siteIDs.includes(site.siteID)),
              };
            }
            return v;
          });
          return {
            ...cat,
            views: updatedViews,
          };
        }
        return cat;
      });
      return { catalogs: updatedCatalogs };
    }),

  addVariable: (catalogName, viewName, newVariable) =>
    set((state) => {
      const updatedCatalogs = state.catalogs.map((cat) => {
        if (cat.name === catalogName) {
          const updatedViews = cat.views.map((v) => {
            if (v.name === viewName) {
              return {
                ...v,
                variables: [...v.variables, newVariable],
              };
            }
            return v;
          });
          return {
            ...cat,
            views: updatedViews,
          };
        }
        return cat;
      });
      return { catalogs: updatedCatalogs };
    }),

  deleteVariable: (catalogName, viewName, variableName) =>
    set((state) => {
      const updatedCatalogs = state.catalogs.map((cat) => {
        if (cat.name === catalogName) {
          const updatedViews = cat.views.map((v) => {
            if (v.name === viewName) {
              return {
                ...v,
                variables: v.variables.filter((variable) => variable !== variableName),
              };
            }
            return v;
          });
          return {
            ...cat,
            views: updatedViews,
          };
        }
        return cat;
      });
      return { catalogs: updatedCatalogs };
    }),
}));

export default useCatalogStore;
