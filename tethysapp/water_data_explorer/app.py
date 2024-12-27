from tethys_sdk.base import TethysAppBase
from tethys_sdk.app_settings import PersistentStoreDatabaseSetting
from tethys_sdk.permissions import Permission, PermissionGroup



class App(TethysAppBase):
    """
    Tethys app class for Water Data Explorer.
    """

    name = 'Water Data Explorer'
    index = 'home'
    icon = 'water_data_explorer/images/wde.png'
    package = 'water_data_explorer'
    root_url = 'water-data-explorer'
    color = '#868e96'
    description = '"A tethys app that lets the user to visualize and query WSDL enpoints'
    tags = '"Hydrology", "WMO", "BYU"'
    enable_feedback = False
    feedback_emails = []
    # controller_modules = ['startAll', 'sites', 'endpoints', 'catalogs','catalogsR', ]

    DATABASE_NAME = "wde_db"
    def permissions(self):
        """
        Example permissions method.
        """
        # Viewer Permissions
        delete_hydrogroups = Permission(
            name='delete_hydrogroups',
            description='Delete a Hydrogroup from the App',
        )

        block_map = Permission(
            name='block_map',
            description='locks the map to a certain limit',
        )
        use_wde = Permission(
            name='use_wde',
            description='Use WDE'
        )
        can_download = Permission(
            name='can_download',
            description='download data if logged in'
        )
        download_at_least = PermissionGroup(
            name='download_at_least',
            permissions=(can_download,)
        )

        admin = PermissionGroup(
            name='admin',
            permissions=(delete_hydrogroups, block_map, use_wde)
        )

        permissions = (admin, download_at_least)

        return permissions

    # Persistant storage
    def persistent_store_settings(self):
        ps_settings = (
            PersistentStoreDatabaseSetting(
                name= self.DATABASE_NAME,
                description='wde database',
                initializer='water_data_explorer.model.init_db.create_tables',
                required=True
            ),
        )
        return ps_settings
