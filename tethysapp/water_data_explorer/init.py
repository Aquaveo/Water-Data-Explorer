from .model.init_db import create_tables

def initializer_function(engine, first_time):
    create_tables(engine, first_time)
