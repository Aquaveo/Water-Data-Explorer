from enum import auto, unique

from strenum import StrEnum  # TODO: Replace with built-in StrEnum when upgrade to >= Python 3.11


@unique
class BackendActions(StrEnum):
    IMPORT_CATALOG = auto()
    GET_LIST_SERVICES = auto()
    GET_LIST_CATALOGS = auto()
    IMPORT_VIEW = auto()
    GET_VIEWS_FROM_CATALOG = auto()
    GET_VIEW = auto()
    MESSAGE_AKNOWLEDGE = auto()
    MESSAGE_ERROR = auto()