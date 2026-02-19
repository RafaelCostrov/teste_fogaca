from sqlalchemy import and_
from model.fogazza import Fogazza
from db.db import Session


class FogazzaRepository:

    def __init__(self):
        self.session = Session

    def adicionar_fogazza(self, fogazza: Fogazza):
        try:
            self.session.add(fogazza)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise e

    def listar_fogazzas(self):
        try:
            return self.session.query(Fogazza).all()
        except Exception as e:
            raise e

    def filtrar_fogazzas(self, id_fogazza=None, nome=None, preco_min=None, preco_max=None, offset=None, limit=None, order_by=None, order_dir=None):
        try:
            query = self.session.query(Fogazza)
            filtros = []

            if id_fogazza is not None:
                filtros.append(Fogazza.id_fogazza == id_fogazza)
            if nome is not None:
                filtros.append(Fogazza.nome.ilike(f"%{nome}%"))
            if preco_min is not None:
                filtros.append(Fogazza.preco >= preco_min)
            if preco_max is not None:
                filtros.append(Fogazza.preco <= preco_max)

            query = query.filter(and_(*filtros))

            campos_validos = {
                "id_fogazza": Fogazza.id_fogazza,
                "nome_fogazza": Fogazza.nome,
                "preco_fogazza": Fogazza.preco,
            }

            if order_by in campos_validos:
                coluna = campos_validos[order_by]
                if order_dir == 'desc':
                    coluna = coluna.desc()
                else:
                    coluna = coluna.asc()
                query = query.order_by(coluna)

            if offset is not None:
                query = query.offset(offset)
            if limit is not None:
                query = query.limit(limit)

            return query.all()

        except Exception as e:
            raise e

    def filtrar_por_id(self, id_fogazza):
        try:
            return self.session.query(Fogazza).filter(Fogazza.id_fogazza == id_fogazza).first()
        except Exception as e:
            raise e

    def remover_fogazza(self, id_fogazza):
        try:
            fogazza = self.filtrar_por_id(id_fogazza)
            if fogazza is not None:
                self.session.delete(fogazza)
                self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise e
