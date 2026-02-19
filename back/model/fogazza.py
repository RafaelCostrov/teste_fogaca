from sqlalchemy import Column, Integer, String, Enum, Table, Float, ForeignKey
from db.db import Base


class Fogazza(Base):
    __tablename__ = 'fogazza'

    id_fogazza = Column(Integer, primary_key=True, autoincrement=True)
    nome_fogazza = Column(String(100), nullable=False)
    preco_fogazza = Column(Float, nullable=False)
