from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, ForeignKey, Integer,
    Float, ARRAY
)
from sqlalchemy.dialects.postgresql import UUID, DOUBLE_PRECISION, ARRAY
from sqlalchemy.orm import relationship
import uuid

from .__base import Base

class DataStreamBase(Base):
    """
    Polymorphic base for all datastreams.
    Stored in 'datastream_base' with a 'type' to distinguish 
    hydroserver2 vs. cuahsi streams.
    """
    __tablename__ = "datastream_base"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String(50), nullable=False)
    name = Column(String(255))
    no_data_value = Column(Float, name="noDataValue")
    tags = Column(ARRAY(String), default=[])

    # Relationship to the polymorphic SiteBase:
    site_id = Column(UUID(as_uuid=True), ForeignKey("site_base.id"))
    site = relationship("SiteBase", back_populates="datastreams")

    __mapper_args__ = {
        "polymorphic_on": type,
        "polymorphic_identity": "datastream_base"
    }


class HydroServer2Datastream(DataStreamBase):
    __tablename__ = "hydroserver2_datastream"

    # Reuse the PK
    id = Column(UUID(as_uuid=True), ForeignKey("datastream_base.id"), primary_key=True)
    description = Column(Text, nullable=True)
    sensor_id = Column(String(255), name="sensorId")
    observation_property_id = Column(String(255), name="observationPropertyId")
    unit_id = Column(String(255), name='unitId')
    unit_name = Column(String(255), name='unitName')
    processing_level_id = Column(String(255), name='processingLevelId')
    processing_level_code = Column(String(255), name='processingLevelCode')
    observation_type = Column(String(255), name='observationType')
    result_type = Column(String(255), name='resultType')
    status = Column(String(255), nullable=True)
    sampled_medium = Column(String(255), name='sampledMedium')
    value_count = Column(Integer, nullable=True, name='valueCount')
    intended_time_spacing = Column(DOUBLE_PRECISION, nullable=True, name='intendedTimeSpacing')
    intended_time_spacing_units = Column(String(255), nullable=True, name='intendedTimeSpacingUnits')
    aggregation_statistic = Column(String(255), name='aggregationStatistic')
    time_aggregation_interval = Column(DOUBLE_PRECISION, name='timeAggregationInterval')
    time_aggregation_interval_units = Column(String(255), name='timeAggregationIntervalUnits')
    phenomenon_begin_time = Column(DateTime, nullable=True, name='phenomenonBeginTime')
    phenomenon_end_time = Column(DateTime, nullable=True, name='phenomenonEndTime')
    is_visible = Column(Boolean, default=True, name='isVisible')
    is_data_visible = Column(Boolean, default=True, name='isDataVisible')
    data_source_column = Column(String(255), nullable=True, name='dataSourceColumn')
    archived = Column(Boolean, default=False)
    observed_area = Column(String(255), nullable=True, name='observedArea')
    result_end_time = Column(DateTime, nullable=True, name='resultEndTime')
    result_begin_time = Column(DateTime, nullable=True, name='resultBeginTime')

    __mapper_args__ = {
        "polymorphic_identity": "hydroserver2_datastream"
    }


class CUAHSIDataStream(DataStreamBase):
    __tablename__ = "cuahsi_datastream"

    # Reuse the PK
    id = Column(UUID(as_uuid=True), ForeignKey("datastream_base.id"), primary_key=True)

    code = Column(String(1000))
    value_type = Column(String(1000), name="valueType")
    general_category = Column(String(1000), name="generalCategory")
    data_type = Column(String(1000), name="dataType")
    sample_medium = Column(String(1000), name="sampleMedium")
    unit_name = Column(String(1000), name="unitName")
    unit_type = Column(String(1000), name="unitType")
    unit_abbreviation = Column(String(1000), name="unitAbbreviation")
    is_regular = Column(Boolean, name="isRegular")
    time_unit_name = Column(String(1000), name="timeUnitName")
    time_unit_abbreviation = Column(String(1000), name="timeUnitAbbreviation")
    time_support = Column(DOUBLE_PRECISION, name="timeSupport")
    speciation = Column(String(1000), name="speciation")

    __mapper_args__ = {
        "polymorphic_identity": "cuahsi_datastream"
    }
