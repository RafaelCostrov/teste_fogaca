from flask import Blueprint, request, jsonify, session, send_file
from service.atendimento_service import AtendimentoService
from datetime import datetime

atendimento_bp = Blueprint('atendimento', __name__, url_prefix="/atendimento")

atendimento_service = AtendimentoService()


@atendimento_bp.route('/adicionar', methods=['POST'])
def adicionar_atendimento():
    try:
        data = request.get_json()
        tipo_cliente = data.get('tipo_cliente')
        fogazzas = data.get('fogazzas')
        resultado = atendimento_service.adicionar_atendimento(
            tipo_cliente=tipo_cliente, fogazzas=fogazzas)
        return jsonify(resultado), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@atendimento_bp.route('/listar', methods=['GET'])
def listar_atendimentos():
    try:
        atendimentos = atendimento_service.listar_atendimentos()
        resultado = []
        for atendimento in atendimentos:
            itens = []
            for item in atendimento.itens:
                itens.append({
                    "id_fogazza": item.id_fogazza,
                    "quantidade": item.quantidade
                })
            resultado.append({
                "id_atendimento": atendimento.id_atendimento,
                "tipo_cliente": atendimento.tipo_cliente.value,
                "preco_total": atendimento.preco_total,
                "comprado_em": atendimento.comprado_em.strftime("%Y-%m-%d %H:%M:%S"),
                "itens": itens
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@atendimento_bp.route('/filtrar', methods=['POST'])
def filtrar_atendimentos():
    try:
        data = request.get_json()
        id_atendimento = data.get('id_atendimento')
        tipo_cliente = data.get('tipo_cliente')
        preco_min = data.get('preco_min')
        preco_max = data.get('preco_max')
        data_hora_inicio = data.get('data_hora_min')
        data_hora_fim = data.get('data_hora_max')
        pagina = data.get('pagina', 1)
        limit = data.get('limit', 50)
        order_by = data.get('order_by', 'comprado_em')
        order_dir = data.get('order_dir', 'desc')
        resultado = atendimento_service.filtrar_atendimentos(
            id_atendimento=id_atendimento,
            tipo_cliente=tipo_cliente,
            preco_min=preco_min,
            preco_max=preco_max,
            data_hora_inicio=data_hora_inicio,
            data_hora_fim=data_hora_fim,
            pagina=pagina,
            limit=limit,
            order_by=order_by,
            order_dir=order_dir
        )
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@atendimento_bp.route('/remover', methods=['DELETE'])
def remover_atendimento():
    try:
        data = request.get_json()
        id_atendimento = data.get('id_atendimento')
        atendimento_service.remover_atendimento(id_atendimento)
        return jsonify({"mensagem": "Atendimento removido com sucesso!"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@atendimento_bp.route('/atualizar', methods=['PUT'])
def atualizar_atendimento():
    try:
        data = request.get_json()
        id_atendimento = data.get('id_atendimento')
        tipo_cliente = data.get('tipo_cliente')
        fogazzas = data.get('fogazzas')
        atendimento_service.atualizar_atendimento(
            id_atendimento=id_atendimento,
            tipo_cliente=tipo_cliente,
            fogazzas=fogazzas
        )
        return jsonify({"mensagem": "Atendimento atualizado com sucesso!"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@atendimento_bp.route('/imprimir', methods=['POST'])
def imprimir_atendimento():
    try:
        data = request.get_json()
        id_atendimento = data.get('id_atendimento')
        atendimento_service.imprimir_atendimento(id_atendimento)
        return jsonify({"mensagem": "Recibo impresso com sucesso!"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
