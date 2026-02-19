from sqlalchemy import Column, Integer, Enum, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from enums.tipo_cliente import TipoCliente
from db.db import Base


class AtendimentoFogazza(Base):
    __tablename__ = 'atendimento_fogazza'

    id_atendimento = Column(Integer, ForeignKey(
        'atendimento.id_atendimento'), primary_key=True)
    id_fogazza = Column(Integer, ForeignKey(
        'fogazza.id_fogazza'), primary_key=True)
    quantidade = Column(Integer, nullable=False)

    fogazza = relationship("Fogazza")


class Atendimento(Base):
    __tablename__ = 'atendimento'

    id_atendimento = Column(Integer, primary_key=True, autoincrement=True)
    tipo_cliente = Column(Enum(TipoCliente), nullable=False)
    preco_total = Column(Float, nullable=False)
    comprado_em = Column(DateTime, nullable=False)

    itens = relationship("AtendimentoFogazza", cascade="all, delete-orphan")
