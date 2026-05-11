import { useState } from 'react'
import { HiCheckCircle, HiPrinter, HiXMark } from 'react-icons/hi2'
import { IoBagHandle } from 'react-icons/io5'
import { toast } from 'react-toastify'
import { atendimentoService } from '../services/api'

function ModalImpressao({ isOpen, onClose, atendimento, itensSelecionados = [], fogazzas = [], paraViagem = false, validarImpressao = true }) {
  const [imprimindo, setImprimindo] = useState(false)
  const [segundaViaImpressa, setSegundaViaImpressa] = useState(false)

  if (!isOpen) return null

  const getNomeFogazza = (idFogazza) => {
    const itemSelecionado = itensSelecionados.find(f => f.id === idFogazza);
    if (itemSelecionado && itemSelecionado.nome) {
      return itemSelecionado.nome;
    }
    const fogazza = fogazzas.find(f => f.id_fogazza === idFogazza);
    if (fogazza && fogazza.nome_fogazza) {
      return fogazza.nome_fogazza;
    }
    return `Fogazza ID: ${idFogazza}`;
  }

  const imprimirSegundaVia = async () => {
    try {
      setImprimindo(true)
      await atendimentoService.imprimir(atendimento.id_atendimento, 2)
      toast.success('Segunda via impressa com sucesso!')
      if (validarImpressao) setSegundaViaImpressa(true)
    } catch (error) {
      console.error('Erro ao imprimir segunda via:', error)
      toast.error('Erro ao imprimir segunda via. Verifique a impressora.')
    } finally {
      setImprimindo(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <HiCheckCircle className="text-green-igreja text-3xl" />
            <h2 className="text-xl font-semibold text-green-igreja">Atendimento Finalizado - {atendimento?.id_atendimento}</h2>
          </div>
          <button
            onClick={() => {
              if (validarImpressao && !segundaViaImpressa) {
                toast.warning('É necessário imprimir a segunda via!');
                return;
              }
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <HiXMark size={24} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
        {atendimento?.itens && (
            <div>
              <p className="text-gray-500 text-sm mb-2">Itens:</p>
              <div className="space-y-1">
                {atendimento.itens.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span>{item.quantidade}x {getNomeFogazza(item.id_fogazza)}</span>
                    <span className='text-yellow-igreja'>R$ {(item.quantidade * item.preco_fogazza).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500">Tipo de Cliente:</p>
              <p className="font-semibold capitalize text-yellow-igreja">{atendimento?.tipo_cliente}</p>
            </div>
            <div>
              <p className="text-gray-500">Valor Total:</p>
              <p className="font-semibold text-green-igreja">R$ {atendimento?.preco_total?.toFixed(2)}</p>
            </div>
          </div>
          {paraViagem && (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500">Para Viagem:</p>
                <div className="flex items-center gap-2">
                  <IoBagHandle style={{ color: '#056839', width: '24px', height: '24px' }} />
                  <span className="font-semibold text-green-igreja">Sim</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {/* <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            Fechar
          </button> */}
          <button
            onClick={imprimirSegundaVia}
            disabled={imprimindo || (segundaViaImpressa && validarImpressao)}
            className="flex-1 px-4 py-3 bg-green-igreja text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <HiPrinter size={18} />
            {imprimindo ? 'Imprimindo...' : segundaViaImpressa ? 'Segunda Via Impressa' : 'Segunda Via'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalImpressao
