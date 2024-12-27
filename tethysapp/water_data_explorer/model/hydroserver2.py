from sqlalchemy.dialects.postgresql import UUID, JSON, DOUBLE_PRECISION
from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import uuid

HydroServer2Base = declarative_base()


class HydroServer2Catalog(HydroServer2Base):
    __tablename__ = 'hydroserver2_catalog'
    # Use UUID for the PK
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(1000))
    tags = Column(String(1000))

    # relationship references Python class "Hydroserver2"
    services = relationship(
        "Hydroserver2",
        back_populates="catalog",
        cascade="all, delete, delete-orphan"
    )

    def __init__(self, name, tags):
        self.name = name
        self.tags = tags


class Hydroserver2(HydroServer2Base):
    __tablename__ = 'hydroserver2'

    # Use UUID for the PK to match the catalog PK type
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(1000))
    url = Column(String(2083))
    description = Column(Text)
    countries = Column(JSON)

    # The foreign key must match the table name 'hydroserver2_catalog' and the PK 'id'
    catalog_id = Column(UUID(as_uuid=True), ForeignKey('hydroserver2_catalog.id'))
    catalog = relationship("HydroServer2Catalog", back_populates="services")

    # If "Thing" references this as `site`, you need to fix the relationship name accordingly
    # But let's assume you want Hydroserver2 -> Things
    things = relationship(
        "Thing",
        back_populates="server2",
        cascade="all, delete, delete-orphan"
    )

    # siteinfo and variables fields are referenced in __init__, 
    # but not declared as columns or relationships. Add them if needed.
    # siteinfo = Column(JSON)
    # variables = Column(JSON)

    def __init__(self, title, url, description, siteinfo, variables, countries):
        self.title = title
        self.url = url
        self.description = description
        self.siteinfo = siteinfo
        self.variables = variables
        self.countries = countries


class Thing(HydroServer2Base):
    __tablename__ = 'thing'

    # Use UUID for PK
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200))
    description = Column(Text)
    sampling_feature_type = Column(String(200), name='samplingFeatureType')
    sampling_feature_code = Column(String(200), name='samplingFeatureCode')
    site_type = Column(String(200), name='siteType')
    is_private = Column(Boolean, default=False, name='isPrivate')
    data_disclaimer = Column(Text, nullable=True, name='dataDisclaimer')
    latitude = Column(DOUBLE_PRECISION)
    longitude = Column(DOUBLE_PRECISION)
    elevation_m = Column(DOUBLE_PRECISION, nullable=True)
    elevation_datum = Column(String(255), nullable=True, name='elevationDatum')
    state = Column(String(200), nullable=True)
    county = Column(String(200), nullable=True)
    country = Column(String(2), nullable=True)

    # Relationship to Datastream
    datastreams = relationship(
        "Datastream",
        back_populates="thing",
        cascade="all, delete, delete-orphan"
    )

    # If this "Thing" belongs to a Hydroserver2 instance, 
    # then we need a foreign key referencing hydroserever2.id
    server2_id = Column(UUID(as_uuid=True), ForeignKey('hydroserver2.id'))
    server2 = relationship("Hydroserver2", back_populates="things")

    def __init__(
        self, name, description, sampling_feature_type, sampling_feature_code,
        site_type, is_private, data_disclaimer, latitude, longitude,
        elevation_m, elevation_datum, state, county, country
    ):
        self.name = name
        self.description = description
        self.sampling_feature_type = sampling_feature_type
        self.sampling_feature_code = sampling_feature_code
        self.site_type = site_type
        self.is_private = is_private
        self.data_disclaimer = data_disclaimer
        self.latitude = latitude
        self.longitude = longitude
        self.elevation_m = elevation_m
        self.elevation_datum = elevation_datum
        self.state = state
        self.county = county
        self.country = country


class Datastream(HydroServer2Base):
    __tablename__ = 'datastream'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255))
    description = Column(Text)

    # Must match 'thing.id' as UUID
    thing_id = Column(UUID(as_uuid=True), ForeignKey('thing.id'), name='thingId')
    thing = relationship("Thing", back_populates="datastreams")

    sensor_id = Column(String(255), name='sensorId')
    sensor_name = Column(String(255), name='sensorName')
    observation_property_id = Column(String(255), name='observationPropertyId')
    observation_property_name = Column(String(255), name='observationPropertyName')
    unit_id = Column(String(255), name='unitId')
    unit_name = Column(String(255), name='unitName')
    processing_level_id = Column(String(255), name='processingLevelId')
    processing_level_code = Column(String(255), name='processingLevelCode')
    observation_type = Column(String(255), name='observationType')
    result_type = Column(String(255), name='resultType')
    status = Column(String(255), nullable=True)
    sampled_medium = Column(String(255), name='sampledMedium')
    value_count = Column(Integer, nullable=True, name='valueCount')
    no_data_value = Column(DOUBLE_PRECISION, name='noDataValue')
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

    def __init__(
        self, name, description, thing_id, sensor_id, sensor_name,
        observation_property_id, observation_property_name, unit_id, unit_name,
        processing_level_id, processing_level_code, observation_type, result_type,
        sampled_medium, value_count, no_data_value, intended_time_spacing,
        intended_time_spacing_units, aggregation_statistic, time_aggregation_interval,
        time_aggregation_interval_units, phenomenon_begin_time, phenomenon_end_time,
        is_visible, is_data_visible, data_source_column, archived, observed_area,
        result_end_time, result_begin_time
    ):
        self.name = name
        self.description = description
        self.thing_id = thing_id
        self.sensor_id = sensor_id
        self.sensor_name = sensor_name
        self.observation_property_id = observation_property_id
        self.observation_property_name = observation_property_name
        self.unit_id = unit_id
        self.unit_name = unit_name
        self.processing_level_id = processing_level_id
        self.processing_level_code = processing_level_code
        self.observation_type = observation_type
        self.result_type = result_type
        self.sampled_medium = sampled_medium
        self.value_count = value_count
        self.no_data_value = no_data_value
        self.intended_time_spacing = intended_time_spacing
        self.intended_time_spacing_units = intended_time_spacing_units
        self.aggregation_statistic = aggregation_statistic
        self.time_aggregation_interval = time_aggregation_interval
        self.time_aggregation_interval_units = time_aggregation_interval_units
        self.phenomenon_begin_time = phenomenon_begin_time
        self.phenomenon_end_time = phenomenon_end_time
        self.is_visible = is_visible
        self.is_data_visible = is_data_visible
        self.data_source_column = data_source_column
        self.archived = archived
        self.observed_area = observed_area
        self.result_end_time = result_end_time
        self.result_begin_time = result_begin_time
