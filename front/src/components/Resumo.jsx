import { useState, useEffect } from 'react'
import { HiClipboardDocumentList } from 'react-icons/hi2'
import { toast } from 'react-toastify'
import { atendimentoService } from '../services/api'
import ModalImpressao from './ModalImpressao'
import IconCheckboxes from './CheckboxViagem'

function Resumo({ itensSelecionados = [], onFinalizarAtendimento }) {
  const [valorRecebido, setValorRecebido] = useState('')
  const [tipoCliente, setTipoCliente] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [atendimentoFinalizado, setAtendimentoFinalizado] = useState(null)
  const [paraViagem, setParaViagem] = useState(false)
  const [primeiraViaFalhou, setPrimeiraViaFalhou] = useState(false)

  const totalItens = itensSelecionados.reduce((acc, item) => acc + item.quantidade, 0)
  const valorTotal = itensSelecionados.reduce((acc, item) => acc + (item.quantidade * item.preco), 0)
  const troco = valorRecebido ? parseFloat(valorRecebido) - valorTotal : 0

  useEffect(() => {
    if (valorTotal > 0) {
      setValorRecebido(valorTotal.toFixed(2))
    } else {
      setValorRecebido('')
    }
  }, [valorTotal])

  const finalizarAtendimento = async () => {
    if (!tipoCliente) {
      toast.error('Por favor, selecione o tipo de cliente.')
      return
    }

    if (totalItens === 0) {
      toast.error('Adicione pelo menos um item ao atendimento.')
      return
    }

    try {
      setCarregando(true)

      const fogazzasData = itensSelecionados
        .filter(item => item.quantidade > 0)
        .map(item => ({
          id_fogazza: item.id,
          quantidade: item.quantidade
        }))

      const atendimentoData = {
        tipo_cliente: tipoCliente,
        fogazzas: fogazzasData,
        viagem: paraViagem
      }

      const response = await atendimentoService.adicionar(atendimentoData)

      setAtendimentoFinalizado(response)
      setPrimeiraViaFalhou(false)
      setModalAberto(true)

      toast.info('Enviando para impressão...')
      try {
        await atendimentoService.imprimir(response.id_atendimento, 1)
        toast.success('Recibo impresso!')
      } catch (printError) {
        console.error('Erro ao imprimir:', printError)
        setPrimeiraViaFalhou(true)
        toast.warning('Atendimento salvo, mas houve erro na impressão. Verifique a impressora.')
      }

    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error)
      toast.error('Erro ao finalizar atendimento. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  const fecharModal = () => {
    setModalAberto(false)
    setAtendimentoFinalizado(null)

    if (onFinalizarAtendimento) {
      onFinalizarAtendimento(atendimentoFinalizado)
    }

    setTipoCliente('')
    setValorRecebido('')
    setParaViagem(false)
  }

  return (
    <div className="w-full mt-6 max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-green-igreja text-white p-4">
        <div className="flex items-center gap-2">
          <HiClipboardDocumentList size={24} />
          <h3 className="text-lg font-semibold">Resumo da Venda</h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Lista de Itens */}
        <div className="space-y-2">
          {itensSelecionados.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-slate-600">
                {item.quantidade}x {item.nome}
              </span>
              <span className="font-semibold">R$ {(item.quantidade * item.preco).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <hr className="border-slate-200" />

        <div className="flex justify-between">
          <span className="text-slate-600">Tipo de cliente:*</span>
          <select
            value={tipoCliente}
            onChange={(e) => setTipoCliente(e.target.value)}
            className=" w-32 border-2 border-slate-300 rounded-lg p-1 focus:outline-none focus:border-green-igreja"
          >
            <option value="">Selecione...</option>
            <option value="visitante">Visitante</option>
            <option value="equipe">Equipe</option>
            <option value="voluntario">Voluntário</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-600">É para viagem?</span>
          <IconCheckboxes
            checked={paraViagem}
            onChange={(e) => setParaViagem(e.target.checked)}
            title="Marque se o atendimento é para viagem"

          />
        </div>

        <div className="flex justify-between">
          <span className="text-slate-600">Total:</span>
          <span className="font-bold text-red-igreja">{totalItens}</span>
        </div>


        <div className="bg-green-igreja text-white p-3 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Valor Total:</span>
            <span className="text-xl font-bold">R$ {valorTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <label className="text-yellow-600 font-medium">
            Valor Recebido:
          </label>
          <input
            type="number"
            step="0.01"
            value={valorRecebido}
            onChange={(e) => setValorRecebido(e.target.value)}
            className="w-32 p-1 border-2 border-slate-300 rounded-lg text-right text-lg font-semibold focus:outline-none focus:border-yellow-700"
            placeholder="0,00"
          />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-green-igreja font-semibold">Troco:</span>
          <span className="text-green-igreja text-xl font-bold">
            R$ {Math.max(0, troco).toFixed(2)}
          </span>
        </div>



        <button
          onClick={finalizarAtendimento}
          className="w-full bg-red-igreja text-white py-4 rounded-xl font-semibold text-lg hover:bg-red-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={totalItens === 0 || carregando || !tipoCliente}
        >
          {carregando ? 'Processando...' : 'Finalizar Atendimento'}
        </button>
      </div>

      {/* Modal de Atendimento */}
      <ModalImpressao
        isOpen={modalAberto}
        onClose={fecharModal}
        atendimento={atendimentoFinalizado}
        itensSelecionados={itensSelecionados}
        paraViagem={paraViagem}
        primeiraViaFalhou={primeiraViaFalhou}
      />
    </div>
  )
}

export default Resumo
