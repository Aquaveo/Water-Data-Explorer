from enum import auto, unique

from strenum import StrEnum  # TODO: Replace with built-in StrEnum when upgrade to >= Python 3.11


@unique
class BackendActions(StrEnum):
    IMPORT_SITES_FROM_CATALOG = auto()
    GET_IMPORTED_CUAHSI_SITES = auto()
    GET_LIST_SERVICES = auto()
    GET_SITES = auto()
    GET_SITE = auto()
    IMPORT_SITES = auto()
    MESSAGE_AKNOWLEDGE = auto()
    MESSAGE_ERROR = auto()
    GET_SITE_INFO = auto()