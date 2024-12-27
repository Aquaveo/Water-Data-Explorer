from sqlalchemy.dialects.postgresql import UUID, DOUBLE_PRECISION
from sqlalchemy import Column, Integer, String, ForeignKey, Text,Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import uuid


Base = declarative_base()

class HISCatalog(Base):
    __tablename__ = 'his_catalog'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(1000))  
    tags = Column(String(1000))
    services = relationship("cuahsi_service", back_populates ="catalog", cascade = "all,delete, delete-orphan" )
    
    def __init__(self,name, tags):
        self.name = name
        self.tags= tags


class CUAHSIService(Base):
    __tablename__ = "cuahsi_service"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(1000))  # Title as given by the admin
    url = Column(String(2083))  # URL of the SOAP endpointx
    description = Column(Text)  # URL of the SOAP endpointx
    variables = relationship("CUAHSIVariable", back_populates="service", cascade = "all,delete, delete-orphan" )
    variablecount = Column(Integer)
    valuecount = Column(Integer)
    sitecount = Column(Integer)
    countries = Column(String(2083))
    catalog_id = Column(Integer, ForeignKey('HISCatalog.id'))
    catalog = relationship("HISCatalog", back_populates="services")  # Tile as given by the admin
    sites  = relationship("Site", back_populates="service", cascade = "all,delete, delete-orphan" )
    
    def __init__(self, title, url, description, variables,variablecount,sitecount, countries):
        self.title = title
        self.url = url
        self.description = description
        self.variables = variables
        self.countries = countries
        self.variablecount = variablecount
        self.sitecount = sitecount



class CUAHSISite(Base):
    __tablename__ = 'cuahsi_site'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(1000))  # Title as given by the admin
    code = Column(String(1000))  # URL of the SOAP endpointx
    description = Column(Text)  # URL of the SOAP endpointx
    latitude = Column(DOUBLE_PRECISION)
    longitude = Column(DOUBLE_PRECISION)
    elevation = Column(DOUBLE_PRECISION)
    variables = relationship("CUAHSIVariable", back_populates="site", cascade = "all,delete, delete-orphan" )
    countries = Column(Text)
    service_id = Column(Integer, ForeignKey('cuahsi_service.id'))
    service = relationship("CUAHSIService", back_populates="sites")  # Tile as given by the admin


class CUAHSIVariable(Base):
    __tablename__ = 'cuahsi_variable'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(1000))
    code = Column(String(1000))
    value_type = Column(String(1000))
    general_category = Column(String(1000))
    data_type = Column(String(1000))
    sample_medium = Column(String(1000))
    unit_name = Column(String(1000))
    unit_type = Column(String(1000))
    unit_abbreviation = Column(String(1000))
    no_data_value = Column(DOUBLE_PRECISION)
    is_regular = Column(Boolean)
    time_unit_name = Column(String(1000))
    time_unit_abbreviation = Column(String(1000))
    time_support = Column(DOUBLE_PRECISION)
    speciation = Column(String(1000))
    site_id = Column(Integer, ForeignKey('cuahsi_site.id'))
    site = relationship("Site", back_populates="variables")  # Tile as given by the admin

def create_cuahsi_tables(engine):
    Base.metadata.create_all(engine)

