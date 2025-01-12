# from sqlalchemy.orm import sessionmaker
# from . import cuahsi
# from . import hydroserver2
# def create_tables(engine, first_time):
#     print("Initializing Persistant Storage")
#     cuahsi.CuahsiBase.metadata.create_all(engine)
#     hydroserver2.HydroServer2Base.metadata.create_all(engine)
#     if first_time:
#         SessionMaker = sessionmaker(bind=engine)
#         session = SessionMaker()
#         session.close()
#         print("Finishing Initializing Persistant Storage")


from sqlalchemy.orm import sessionmaker
from . import Base 
# Importing so the classes are registered:
from .__site_base import SiteBase, HydroServer2Site, CUAHSISite
from .__datastream_base import DataStreamBase, HydroServer2Datastream, CUAHSIDataStream

def create_tables(engine, first_time):
    print("Initializing Persistent Storage")
    Base.metadata.create_all(engine)  # single call
    if first_time:
        SessionMaker = sessionmaker(bind=engine)
        session = SessionMaker()
        session.close()
        print("Finishing Initializing Persistent Storage")