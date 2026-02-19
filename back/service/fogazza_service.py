from model.fogazza import Fogazza
from repository.fogazza_repository import FogazzaRepository
import os
import random
import string
import pandas as pd
from io import BytesIO


class FogazzaService():

    repositorio = FogazzaRepository()

    def adicionar_fogazza(self, nome_fogazza, preco_fogazza):
        try:
            nova_fogazza = Fogazza(
                nome_fogazza=nome_fogazza, preco_fogazza=preco_fogazza)
            self.repositorio.adicionar_fogazza(nova_fogazza)
            json_fogazza = {
                "id_fogazza": nova_fogazza.id_fogazza,
                "nome_fogazza": nova_fogazza.nome_fogazza,
                "preco_fogazza": nova_fogazza.preco_fogazza
            }
            return json_fogazza
        except Exception as e:
            raise e

    def listar_fogazzas(self):
        try:
            fogazzas = self.repositorio.listar_fogazzas()
            json_fogazzas = []
            for fogazza in fogazzas:
                json_fogazza = {
                    "id_fogazza": fogazza.id_fogazza,
                    "nome_fogazza": fogazza.nome_fogazza,
                    "preco_fogazza": fogazza.preco_fogazza
                }
                json_fogazzas.append(json_fogazza)
            return json_fogazzas
        except Exception as e:
            raise e

    def remover_fogazza(self, id_fogazza):
        try:
            self.repositorio.remover_fogazza(id_fogazza)
        except Exception as e:
            raise e
