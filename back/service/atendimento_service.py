from model.atendimento import Atendimento, AtendimentoFogazza
from repository.fogazza_repository import FogazzaRepository
from repository.atendimento_repository import AtendimentoRepository
from enums.tipo_cliente import TipoCliente
from escpos.printer import Usb
import calendar
import json
import datetime
import pandas as pd
from io import BytesIO


class AtendimentoService():

    def __init__(self, session):
        self.repositorio = AtendimentoRepository(session)
        self.repositorio_fogazza = FogazzaRepository(session)

    def adicionar_atendimento(self, tipo_cliente, fogazzas, viagem, comprado_em=None):
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

            if comprado_em is None:
                comprado_em = datetime.datetime.now()

            if tipo_cliente.upper() == "EQUIPE":
                preco_final = 0

            atendimento = Atendimento(
                tipo_cliente=tipo_cliente,
                preco_total=preco_final,
                comprado_em=comprado_em,
                itens=itens,
                viagem=viagem
            )
            atendimento = self.repositorio.adicionar_atendimento(atendimento)
            return {
                "id_atendimento": atendimento.id_atendimento,
                "tipo_cliente": atendimento.tipo_cliente.value,
                "preco_total": atendimento.preco_total,
                "comprado_em": atendimento.comprado_em.strftime("%Y-%m-%d %H:%M:%S"),
                "viagem": atendimento.viagem,
                "ativo": atendimento.ativo,
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

    def adicionar_atendimentos(self, lista_atendimentos):
        try:
            atendimentos = []
            for data in lista_atendimentos:
                tipo_cliente = data.get('tipo_cliente')
                fogazzas = data.get('fogazzas')
                viagem = data.get('viagem')
                horario = data.get('comprado_em')
                atendimentos.append(self.adicionar_atendimento(
                    tipo_cliente, fogazzas, viagem, comprado_em=horario))
            return atendimentos
        except Exception as e:
            raise e

    def listar_atendimentos(self):
        try:
            return self.repositorio.listar_atendimentos()
        except Exception as e:
            raise e

    def filtrar_atendimentos(self, id_atendimento: list[int] = None, id_fogazzas: list[int] = None, tipo_cliente: list[TipoCliente] = None, preco_min: float = None,
                             preco_max: float = None, data_hora_inicio: datetime.datetime = None, data_hora_fim: datetime.datetime = None,
                             pagina: int = 1, limit: int = 50, order_by: str = "comprado_em", order_dir: str = "asc"):
        try:
            offset = (pagina - 1) * limit
            atendimentos, total, total_filtrado, valor_total = self.repositorio.filtrar_atendimentos(
                id_atendimento=id_atendimento,
                id_fogazzas=id_fogazzas,
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
                    "ativo": atendimento.ativo,
                    "itens": itens
                })
            return {
                "atendimentos": lista_filtrada,
                "total": total,
                "total_filtrado": total_filtrado,
                "valor_total": valor_total
            }
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

    def imprimir_atendimento(self, id_atendimento, via=None):
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
            p.text(f"Pedido: {atendimento.id_atendimento}\n")
            # p.text("-" * 16 + "\n")
            p.set(align='center', custom_size=True, width=1, height=1, bold=False)
            if atendimento.viagem:
                p.text("Viagem: SIM\n")
            else:                
                p.text("Viagem: NAO\n")
            if via:
                p.text(f"Via: {via}/2\n")

            p.set(align='left')
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
            p.text("\n")
            p.text("Deus abencoe!")
            p.cut()
            p.close()
        except Exception as e:
            raise e

    def imprimir_relatorio(self, id_atendimento: list[int] = None, id_fogazzas: list[int] = None, tipo_cliente: list[TipoCliente] = None,
                           preco_min: float = None, preco_max: float = None, data_hora_inicio: datetime.datetime = None,
                           data_hora_fim: datetime.datetime = None):
        try:
            atendimentos, total, total_filtrado, valor_total = self.repositorio.filtrar_atendimentos(
                id_atendimento=id_atendimento,
                id_fogazzas=id_fogazzas,
                tipo_cliente=tipo_cliente,
                preco_min=preco_min,
                preco_max=preco_max,
                data_hora_inicio=data_hora_inicio,
                data_hora_fim=data_hora_fim,
                offset=0,
                limit=100000
            )
            if total_filtrado == 0:
                raise Exception(
                    "Nenhum atendimento encontrado para os filtros aplicados.")
            data = []
            for atendimento in atendimentos:
                for item in atendimento.itens:
                    data.append({
                        "id_atendimento": atendimento.id_atendimento,
                        "tipo_cliente": atendimento.tipo_cliente.value,
                        "preco_total": atendimento.preco_total,
                        "comprado_em": atendimento.comprado_em.strftime("%d/%m/%Y %H:%M:%S"),
                        "id_fogazza": item.id_fogazza,
                        "nome_fogazza": item.fogazza.nome_fogazza,
                        "quantidade": item.quantidade,
                        "preco_fogazza": item.fogazza.preco_fogazza
                    })

            novos_cabecalhos = {
                "id_atendimento": "ID Atendimento",
                "tipo_cliente": "Tipo Cliente",
                "data_atendimento": "Data",
                "preco_total": "Preço Total",
                "comprado_em": "Data do atendimento",
                "id_fogazza": "ID Fogazza",
                "nome_fogazza": "Nome Fogazza",
                "quantidade": "Quantidade",
                "preco_fogazza": "Preço Fogazza",
            }

            map_cliente = {
                "EQUIPE": "Equipe",
                "VISITANTE": "Visitante",
                "VOLUNTARIO": "Voluntário"
            }

            df = pd.DataFrame(data)
            df["tipo_cliente"] = df["tipo_cliente"].map(map_cliente)
            df.rename(columns=novos_cabecalhos, inplace=True)

            def juntar_nomes(nomes):
                return ", ".join(nomes)

            df_agrupado = df.groupby(
                ["ID Atendimento", "Tipo Cliente",
                    "Preço Total", "Data do atendimento"]
            ).agg({
                "Nome Fogazza": juntar_nomes,
                "Quantidade": "sum"
            }).reset_index()

            output = BytesIO()
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                df_agrupado.to_excel(
                    writer, index=False, sheet_name='Atendimentos - Agrupado')
                df.to_excel(writer, index=False,
                            sheet_name='Atendimentos - Detalhado')
            output.seek(0)
            return output
        except Exception as e:
            raise e

    def filtrar_por_data(self, data: datetime.date):
        try:
            atendimentos = self.repositorio.filtrar_por_data(data)
            return atendimentos
        except Exception as e:
            raise e

    def imprimir_relatorio_agregado(self, data_1: datetime.datetime, data_2: datetime.datetime, missa_11_1: bool = False,
                                    missa_11_2: bool = False, missa_17_1: bool = False, missa_17_2: bool = False):
        try:
            datas = [data_1, data_2]
            for data in datas:
                atendimentos = self.repositorio.filtrar_por_data(data=data)
                if len(atendimentos) == 0:
                    raise Exception(
                        f"Nenhum atendimento encontrado para a data {data}.")

                registros = []
                for atendimento in atendimentos:
                    for item in atendimento.itens:
                        registros.append((
                            item.fogazza.nome_fogazza,
                            atendimento.comprado_em,
                            item.quantidade
                        ))

                df = pd.DataFrame(registros, columns=[
                    "Nome Fogazza", "Data do atendimento", "Quantidade"])
                df['hora'] = pd.to_datetime(df['Data do atendimento']).dt.hour
                horas = list(range(11, 23))
                df_filtrado = df[df['hora'].isin(horas)]
                tabela_hora = pd.pivot_table(
                    df_filtrado,
                    values='Quantidade',
                    index='Nome Fogazza',
                    columns='hora',
                    aggfunc='sum',
                    fill_value=0
                )
                tabela_hora['TOTAL'] = tabela_hora.sum(axis=1)
                tabela_hora.loc['TOTAL'] = tabela_hora.sum(axis=0)
                tabela_hora = tabela_hora[[*horas, 'TOTAL']]

                df['hora'] = pd.to_datetime(df['Data do atendimento']).dt.hour
                horas = list(range(11, 23))
                df_filtrado = df[df['hora'].isin(horas)]
                tabela_hora = pd.pivot_table(
                    df_filtrado,
                    values='Quantidade',
                    index='Nome Fogazza',
                    columns='hora',
                    aggfunc='sum',
                    fill_value=0
                )
                tabela_hora['TOTAL'] = tabela_hora.sum(axis=1)
                tabela_hora.loc['TOTAL'] = tabela_hora.sum(axis=0)
                tabela_hora = tabela_hora[[*horas, 'TOTAL']]

                dias_pt = {
                    0: 'Segunda',
                    1: 'Terça',
                    2: 'Quarta',
                    3: 'Quinta',
                    4: 'Sexta',
                    5: 'Sábado',
                    6: 'Domingo'
                }

                output = BytesIO()
                with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                    tabela_hora.to_excel(writer, index=True,
                                         sheet_name='Vendas por Hora')
                    if isinstance(data_1, str):
                        data_1 = datetime.datetime.strptime(data_1, "%Y-%m-%d")
                    if isinstance(data_2, str):
                        data_2 = datetime.datetime.strptime(data_2, "%Y-%m-%d")
                    workbook = writer.book
                    worksheet = writer.sheets['Vendas por Hora']
                    data_relatorio = data_1.strftime('%d/%m/%Y')
                    dia_semana = dias_pt[data_1.weekday()]
                    titulo = f'Relatório de Vendas - {dia_semana} - ({data_relatorio})'
                    col_count = len(tabela_hora.columns) + 1
                    worksheet.merge_range(0, 0, 0, col_count - 1, titulo, workbook.add_format(
                        {'bold': True, 'align': 'center', 'font_size': 14}))

                output = BytesIO()
                with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                    tabela_hora.to_excel(writer, index=True,
                                         sheet_name='Vendas por Hora', startrow=3)

                    if isinstance(data_1, str):
                        data_1 = datetime.datetime.strptime(data_1, "%Y-%m-%d")
                    if isinstance(data_2, str):
                        data_2 = datetime.datetime.strptime(data_2, "%Y-%m-%d")
                    workbook = writer.book
                    worksheet = writer.sheets['Vendas por Hora']
                    data_relatorio = data_1.strftime('%d/%m/%Y')
                    dias_pt = {
                        0: 'Segunda',
                        1: 'Terça',
                        2: 'Quarta',
                        3: 'Quinta',
                        4: 'Sexta',
                        5: 'Sábado',
                        6: 'Domingo'
                    }
                    dia_semana = dias_pt[data_1.weekday()]
                    titulo = f'Relatório de Vendas - {dia_semana} - ({data_relatorio})'
                    col_count = len(tabela_hora.columns) + 1
                    worksheet.merge_range(0, 0, 0, col_count - 1, titulo, workbook.add_format(
                        {'bold': True, 'align': 'center', 'font_size': 14}))

                    missas = []
                    if missa_11_1:
                        missas.append(11)
                    if missa_17_1:
                        missas.append(17)
                    pos_missa_format = workbook.add_format(
                        {'align': 'center', 'bold': True, 'bg_color': '#C6EFCE'})
                    missa_format = workbook.add_format(
                        {'align': 'center', 'bold': True, 'bg_color': '#F4CCCC'})

                    for m in missas:
                        if m in horas:
                            idx_missa = horas.index(m)
                            start_col = idx_missa + 1
                            end_col = min(idx_missa + 3, len(horas) - 1)
                            if start_col <= end_col:
                                worksheet.merge_range(
                                    2, start_col + 1, 2, end_col + 1, 'PÓS-MISSA', pos_missa_format)
                            worksheet.write(2, idx_missa + 1,
                                            'MISSA', missa_format)

                    n_rows = len(tabela_hora)
                    for col_idx, h in enumerate(horas):
                        excel_col = col_idx + 1
                        fmt = None
                        if h in missas:
                            fmt = missa_format
                        elif any(h == m+1 or h == m+2 or h == m+3 for m in missas):
                            fmt = pos_missa_format
                        if fmt:
                            for row in range(4, 4 + n_rows):
                                value = tabela_hora.iloc[row-4, col_idx]
                                worksheet.write(row, excel_col, value, fmt)

                                # --- INFORMAÇÕES GERAIS ---
                    valor_produto = 15.00
                    atendimentos = len(atendimentos)
                    faturamento = tabela_hora.loc['TOTAL', 'TOTAL'] * \
                        valor_produto if 'TOTAL' in tabela_hora.index else 0
                    ticket_medio = faturamento / atendimentos if atendimentos > 0 else 0

                    info_gerais = [
                        ["INFORMAÇÕES GERAIS", ""],
                        ["Valor do Produto", f"R$ {valor_produto:,.2f}"],
                        ["Atendimentos", f"{atendimentos}"],
                        ["Faturamento", f"R$ {faturamento:,.2f}"],
                        ["Ticket Médio", f"{ticket_medio:,.2f}"],
                    ]

                    # --- COMPARATIVO DE VENDAS ---
                    # Pós-missa: 11, 17 (se ativados)
                    pos_missa_horas = []
                    if missa_11_1:
                        pos_missa_horas.extend([11, 12, 13])
                    if missa_17_1:
                        pos_missa_horas.extend([17, 18, 19])
                    # Se quiser incluir missa_11_2 e missa_17_2, adicione aqui

                    total_vendas = tabela_hora.loc['TOTAL',
                                                   'TOTAL'] if 'TOTAL' in tabela_hora.index else 0
                    vendas_pos_missa = tabela_hora.loc['TOTAL', pos_missa_horas].sum(
                    ) if pos_missa_horas and 'TOTAL' in tabela_hora.index else 0
                    vendas_festa = total_vendas - vendas_pos_missa
                    pct_festa = (vendas_festa / total_vendas *
                                 100) if total_vendas > 0 else 0
                    pct_pos_missa = (vendas_pos_missa /
                                     total_vendas * 100) if total_vendas > 0 else 0

                    comparativo_vendas = [
                        ["COMPARATIVO DE VENDAS", ""],
                        ["Festa", f"{pct_festa:.1f}%"],
                        ["Pós-Missa", f"{pct_pos_missa:.1f}%"],
                    ]

                    # --- Escrever as tabelas lado a lado ---
                    # Pular uma linha após tabela_hora e adicionar uma linha em branco
                    start_row = len(tabela_hora) + 5
                    # Linha em branco
                    worksheet.write_blank(start_row - 1, 0, None)
                    # Formatação para títulos mesclados
                    title_format = workbook.add_format(
                        {'bold': True, 'align': 'center', 'font_size': 12, 'bg_color': '#D9E1F2'})

                    # INFORMAÇÕES GERAIS em B e C (col 1 e 2)
                    # INFORMAÇÕES GERAIS em B:F (col 1 a 5)
                    worksheet.merge_range(
                        start_row, 1, start_row, 5, info_gerais[0][0], title_format)
                    for i, row in enumerate(info_gerais[1:]):
                        # label ocupa B:D (1:3), valor ocupa E:F (4:5)
                        worksheet.merge_range(
                            start_row + 1 + i, 1, start_row + 1 + i, 3, row[0])
                        worksheet.merge_range(
                            start_row + 1 + i, 4, start_row + 1 + i, 5, row[1])

                    # COMPARATIVO DE VENDAS em H:L (col 7 a 11)
                    worksheet.merge_range(
                        start_row, 7, start_row, 11, comparativo_vendas[0][0], title_format)
                    for i, row in enumerate(comparativo_vendas[1:]):
                        # label ocupa H:J (7:9), valor ocupa K:L (10:11)
                        worksheet.merge_range(
                            start_row + 1 + i, 7, start_row + 1 + i, 9, row[0])
                        worksheet.merge_range(
                            start_row + 1 + i, 10, start_row + 1 + i, 11, row[1])

                output.seek(0)
            # with open("relatorio_atendimentos.xlsx", "wb") as f:
            #     f.write(output.getbuffer())
            return output
        except Exception as e:
            raise e
