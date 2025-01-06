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
  addCatalogs: (newCatalogs) =>{
    set((state) => ({
      catalogs: [...state.catalogs, ...newCatalogs]
    }))
  },
  deleteCatalog: (id) =>
    set((state) => ({
      catalogs: state.catalogs.filter((cat) => cat.id !== id),
    })),

  addView: (id, newView) =>
    set((state) => {
      // find the catalog
      const updatedCatalogs = state.catalogs.map((cat) => {
        if (cat.id === id) {
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

  addViews: (id, newViews) =>
    set((state) => {
      const updatedCatalogs = state.catalogs.map((cat) => {
        if (cat.id === id) {
          return {
            ...cat,
            views: [...cat.views, ...newViews],
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
  addSites: (catalogID, viewID, newSites) =>
    set((state) => {
      const updatedCatalogs = state.catalogs.map((cat) => {
        if (cat.id === catalogID) {
          const updatedViews = cat.views.map((v) => {
            if (v.id === viewID) {
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
  // ----- DERIVED STATE -----
  getAllViews: () => {
    const catalogs = get().catalogs;
    return catalogs.reduce((acc, catalog) => {
      if (catalog.views && Array.isArray(catalog.views)) {
        return acc.concat(catalog.views);
      }
      return acc;
    }, []);
  },
  getAllSites: () => {
    const catalogs = get().catalogs;
    return catalogs.reduce((acc, catalog) => {
      if (catalog.views && Array.isArray(catalog.views)) {
        catalog.views.forEach((view) => {
          if (view.sites && Array.isArray(view.sites)) {
            acc = acc.concat(view.sites);
          }
        });
      }
      return acc;
    }, []);
  },
}));

export default useCatalogStore;
