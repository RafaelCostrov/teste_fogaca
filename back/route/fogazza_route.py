from flask import Blueprint, request, jsonify, session, send_file
from service.fogazza_service import FogazzaService
from datetime import datetime

fogazza_bp = Blueprint('fogazza', __name__, url_prefix="/fogazza")

fogazza_service = FogazzaService()


@fogazza_bp.route('/adicionar', methods=['POST'])
def adicionar_fogazza():
    try:
        data = request.get_json()
        nome_fogazza = data.get('nome_fogazza')
        preco_fogazza = data.get('preco_fogazza')
        nova_fogazza = fogazza_service.adicionar_fogazza(
            nome_fogazza=nome_fogazza, preco_fogazza=preco_fogazza)
        return jsonify({"mensagem": "Fogazza adicionada com sucesso!", "fogazza": nova_fogazza}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@fogazza_bp.route('/listar', methods=['GET'])
def listar_fogazzas():
    try:
        fogazzas = fogazza_service.listar_fogazzas()
        return jsonify(fogazzas), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@fogazza_bp.route('/remover', methods=['DELETE'])
def remover_fogazza():
    try:
        data = request.get_json()
        id_fogazza = data.get('id_fogazza')
        fogazza_service.remover_fogazza(id_fogazza)
        return jsonify({"mensagem": "Fogazza removida com sucesso!"}), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 400
