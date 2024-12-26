import logging

from tethys_sdk.routing import controller

from tethysapp.water_data_explorer.app import App


logging.basicConfig()

# Disable the pywaterml.auxiliaryMod logger #
for name, logger in logging.root.manager.loggerDict.items():
    if(name=='pywaterml.auxiliaryMod'):
        logging.getLogger('pywaterml.auxiliaryMod').setLevel(logging.CRITICAL)

@controller(name='home', url='water-data-explorer')
def home(request):
    """
    Controller for the app home page.
    """

    return App.render(request, 'index.html')
