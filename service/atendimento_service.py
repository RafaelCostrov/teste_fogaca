from model.atendimento import Atendimento, AtendimentoFogazza
from repository.fogazza_repository import FogazzaRepository
from repository.atendimento_repository import AtendimentoRepository
from enums.tipo_cliente import TipoCliente
from escpos.printer import Usb
import json
import datetime
import pandas as pd
from io import BytesIO


class AtendimentoService():

    repositorio = AtendimentoRepository()
    repositorio_fogazza = FogazzaRepository()

    def adicionar_atendimento(self, tipo_cliente, fogazzas):
        try:
            preco_final = 0
            itens = []

            for item in fogazzas:
                fogazza = self.repositorio_fogazza.filtrar_por_id(
                    item['id_fogazza'])
                quantidade = item['quantidade']
                preco_final += fogazza.preco_fogazza * quantidade
                itens.append(AtendimentoFogazza(
                    id_fogazza=fogazza.id_fogazza,
                    quantidade=quantidade
                ))

            comprado_em = datetime.datetime.now()

            if tipo_cliente.upper() == "EQUIPE":
                preco_final = 0

            atendimento = Atendimento(
                tipo_cliente=tipo_cliente,
                preco_total=preco_final,
                comprado_em=comprado_em,
                itens=itens
            )
            atendimento = self.repositorio.adicionar_atendimento(atendimento)
            return {
                "id_atendimento": atendimento.id_atendimento,
                "tipo_cliente": atendimento.tipo_cliente.value,
                "preco_total": atendimento.preco_total,
                "comprado_em": atendimento.comprado_em.strftime("%Y-%m-%d %H:%M:%S"),
                "itens": [
                    {
                        "id_fogazza": item.id_fogazza,
                        "quantidade": item.quantidade,
                        "preco_fogazza": item.fogazza.preco_fogazza
                    } for item in atendimento.itens
                ]
            }
        except Exception as e:
            raise e

    def listar_atendimentos(self):
        try:
            return self.repositorio.listar_atendimentos()
        except Exception as e:
            raise e

    def filtrar_atendimentos(self, id_atendimento: list[int] = None, tipo_cliente: list[TipoCliente] = None, preco_min: float = None, preco_max: float = None,
                             data_hora_inicio: datetime.datetime = None, data_hora_fim: datetime.datetime = None,
                             pagina: int = 1, limit: int = 50, order_by: str = "comprado_em", order_dir: str = "asc"):
        try:
            offset = (pagina - 1) * limit
            atendimentos = self.repositorio.filtrar_atendimentos(
                id_atendimento=id_atendimento,
                tipo_cliente=tipo_cliente,
                preco_min=preco_min,
                preco_max=preco_max,
                data_hora_inicio=data_hora_inicio,
                data_hora_fim=data_hora_fim,
                offset=offset,
                limit=limit,
                order_by=order_by,
                order_dir=order_dir
            )
            lista_filtrada = []

            for atendimento in atendimentos:
                itens = []
                for item in atendimento.itens:
                    itens.append({
                        "id_fogazza": item.id_fogazza,
                        "quantidade": item.quantidade,
                        "preco_fogazza": item.fogazza.preco_fogazza
                    })
                lista_filtrada.append({
                    "id_atendimento": atendimento.id_atendimento,
                    "tipo_cliente": atendimento.tipo_cliente.value,
                    "preco_total": atendimento.preco_total,
                    "comprado_em": atendimento.comprado_em.strftime("%Y-%m-%d %H:%M:%S"),
                    "itens": itens
                })
            return lista_filtrada
        except Exception as e:
            raise e

    def remover_atendimento(self, id_atendimento):
        try:
            self.repositorio.remover_atendimento(id_atendimento)
        except Exception as e:
            raise e

    def atualizar_atendimento(self, id_atendimento, tipo_cliente=None, fogazzas=None):
        try:
            atendimento = self.repositorio.filtrar_atendimento_por_id(
                id_atendimento)
            if not atendimento:
                raise Exception("Atendimento não encontrado")

            tipo_final = tipo_cliente if tipo_cliente is not None else atendimento.tipo_cliente.value
            preco_total = None
            itens = None

            if fogazzas is not None:
                preco_total = 0
                itens = []
                for item in fogazzas:
                    fogazza = self.repositorio_fogazza.filtrar_por_id(
                        item['id_fogazza'])
                    quantidade = item['quantidade']
                    preco_total += fogazza.preco_fogazza * quantidade
                    itens.append(AtendimentoFogazza(
                        id_fogazza=fogazza.id_fogazza,
                        quantidade=quantidade
                    ))

            if tipo_final.upper() == "EQUIPE":
                preco_total = 0
            elif fogazzas is None and atendimento.tipo_cliente.value.upper() == "EQUIPE":
                preco_total = 0
                for item in atendimento.itens:
                    preco_total += item.fogazza.preco_fogazza * item.quantidade

            self.repositorio.atualizar_atendimento(
                id_atendimento=id_atendimento,
                tipo_cliente=tipo_cliente,
                preco_total=preco_total,
                itens=itens
            )
        except Exception as e:
            raise e

    def imprimir_atendimento(self, id_atendimento):
        try:
            atendimento = self.repositorio.filtrar_atendimento_por_id(
                id_atendimento)
            if not atendimento:
                raise Exception("Atendimento não encontrado")

            p = Usb(0x0FE6, 0x811E, 0)

            p.set(align='center', custom_size=True, width=2, height=2)
            p.text("Barraca Fogazza\n\n")
            p.set(custom_size=True, width=1, height=1, bold=False)
            p.text(atendimento.comprado_em.strftime(
                "%d/%m/%Y %H:%M") + "\n\n")
            p.set(align='center', custom_size=True, width=2, height=2)
            p.text(f"Pedido: {atendimento.id_atendimento}\n\n")
            # p.text("-" * 16 + "\n")

            p.set(align='left')
            p.set(custom_size=True, width=1, height=1, bold=False)
            for item in atendimento.itens:
                nome = item.fogazza.nome_fogazza.capitalize()
                qty = str(item.quantidade)
                preco = f"R$ {item.fogazza.preco_fogazza:,.2f}"
                right = f"{qty} x {preco}".rjust(18)
                space = max(1, 32 - len(nome[:14]) - len(right))
                p.text(nome[:14] + (' ' * space) + right + "\n")

            p.text("-" * 32 + "\n")

            p.set(double_width=True)
            p.text(f"Total: R$ {atendimento.preco_total:,.2f}\n")
            p.set(double_width=False)

            p.text("\n")
            p.set(custom_size=True, width=1,
                  height=1, align='center', bold=True)
            p.text("Obrigado pela preferencia!")
            p.cut()
            p.close()
        except Exception as e:
            raise e
