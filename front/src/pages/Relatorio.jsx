import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import "react-perfect-scrollbar/dist/css/styles.css";
import HistoricoTabela from '../components/DashVendas/HistoricoTabela';
import Modal from '../components/DashVendas/Modal';
import MenuFiltro from '../components/DashVendas/MenuFiltro';
import InputUnico from '../components/DashVendas/InputUnico';
import HeaderRelatorio from '../components/DashVendas/HeaderRelatorio';
import ExportModal from '../components/DashVendas/ExportModal';

export default function Relatorio() {
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [tipoCliente, setTipoCliente] = useState("");
  const [valorMinimo, setValorMinimo] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [modal, setModal] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const onClickFilter = () => setIsFiltered(!isFiltered);
  const onClickModal = (modalType) => setModal(modalType);
  const onCloseModal = () => setModal("");

  const handleExportarRelatorio = async (formato) => {
    console.log(`Exportando relatório em formato ${formato}`);
    onCloseModal();
  };

  const aplicarFiltros = () => {
   
    console.log("Aplicando filtros...");
  };

  const limparForms = () => {
    setDataInicial("");
    setDataFinal("");
    setTipoCliente("");
    setValorMinimo("");
  };

  const algumFiltroAtivo = () => {
    return dataInicial || dataFinal || tipoCliente || valorMinimo;
  };

  return (
    <>
      <section className="flex flex-col h-dvh p-2 md:p-4">
        <HeaderRelatorio
          onClickExportar={() => onClickModal("exportar")}
          onClickFiltrar={onClickFilter}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        <MenuFiltro
          isFiltered={isFiltered}
          onClick={aplicarFiltros}
          onClear={limparForms}
          filtrosAtivos={algumFiltroAtivo()}
        >
          <InputUnico
            nomeInput={"Data Inicial"}
            type={"date"}
            classNameDiv={"md:col-start-1 md:row-start-1"}
            value={dataInicial}
            onChange={e => setDataInicial(e.target.value)}
          />
          <InputUnico
            nomeInput={"Data Final"}
            type={"date"}
            classNameDiv={"md:col-start-2 md:row-start-1"}
            value={dataFinal}
            onChange={e => setDataFinal(e.target.value)}
          />
          <InputUnico
            nomeInput={"Tipo de Cliente"}
            type={"text"}
            classNameDiv={"md:col-start-3 md:row-start-1"}
            value={tipoCliente}
            onChange={e => setTipoCliente(e.target.value)}
          />
          <InputUnico
            nomeInput={"Valor Mínimo"}
            type={"number"}
            classNameDiv={"md:col-start-4 md:row-start-1"}
            value={valorMinimo}
            onChange={e => setValorMinimo(e.target.value)}
          />
        </MenuFiltro>

        <AnimatePresence>
          <HistoricoTabela />
        </AnimatePresence>
      </section>

      {modal === "exportar" && (
        <Modal
          onCloseModal={onCloseModal}
          size={"small"}
          title={"Exportar Relatório"}
        >
          <ExportModal onExportar={handleExportarRelatorio} />
        </Modal>
      )}
    </>
  );
}


