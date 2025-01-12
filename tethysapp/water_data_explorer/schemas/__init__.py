# tethysapp/water_data_explorer/schemas/__init__.py

from .__site_schema import (
    SiteReadBase, CUAHSISiteRead, HydroServer2SiteRead,
    SiteCreateBase, CUAHSISiteCreate, HydroServer2SiteCreate,
    SiteRead, SiteCreate
)
from .__datastream_schema import (
    DataStreamReadBase, CUAHSIDataStreamRead, HydroServer2DatastreamRead,
    DataStreamCreateBase, CUAHSIDataStreamCreate, HydroServer2DatastreamCreate,
    DataStreamCreate, DataStreamRead
)

__all__ = [
    "SiteReadBase",
    "CUAHSISiteRead",
    "HydroServer2SiteRead",
    "SiteCreateBase",
    "CUAHSISiteCreate",
    "HydroServer2SiteCreate",
    "SiteRead",
    "SiteCreate",
    "DataStreamReadBase",
    "CUAHSIDataStreamRead",
    "HydroServer2DatastreamRead",
    "DataStreamCreateBase",
    "CUAHSIDataStreamCreate",
    "HydroServer2DatastreamCreate",
    "DataStreamCreate",
    "DataStreamRead",
]

# After all classes are imported, now we do forward-reference resolution:
CUAHSISiteRead.model_rebuild()
HydroServer2SiteRead.model_rebuild()
CUAHSIDataStreamRead.model_rebuild()
HydroServer2DatastreamRead.model_rebuild()