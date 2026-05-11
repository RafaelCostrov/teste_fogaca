import { useState } from "react";
import IconCheckboxes from "../Checkbox.jsx";
import InputUnico from "./InputUnico.jsx";


export default function ExportModal({ onExportar, filtrosAtivos = {}, saborFogazza = [] }) {
  // const [tab, setTab] = useState("normal");
  const [usarFiltros, setUsarFiltros] = useState(false);
  // const [data1, setData1] = useState("");
  // const [data2, setData2] = useState("");
  // const [missa1_11, setMissa1_11] = useState(false);
  // const [missa1_17, setMissa1_17] = useState(false);
  // const [missa2_11, setMissa2_11] = useState(false);
  // const [missa2_17, setMissa2_17] = useState(false);
  const handleExportar = onExportar || (() => {});
  

  return (
    <>
      {/* Tabs header - comentado: sem tabs por enquanto
      <div className="w-full p-2">
        <div className="flex border-b mb-4">
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold transition-colors duration-200 ${tab === "normal" ? "border-b-2 border-green-700 text-green-700" : "text-gray-600"}`}
            onClick={() => setTab("normal")}
          >
            Normal
          </button>
          <button
            className={`flex-1 py-2 px-4 text-center font-semibold transition-colors duration-200 ${tab === "agregado" ? "border-b-2 border-green-700 text-green-700" : "text-gray-600"}`}
            onClick={() => setTab("agregado")}
          >
            Agregado
          </button>
        </div>
      </div>
      */}

      {/* Tab normal */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-slate-600">Utilizar filtros atuais</span>
        <IconCheckboxes
          checked={usarFiltros}
          onChange={(e) => setUsarFiltros(e.target.checked)}
        />
      </div>
      <div className="mb-4 rounded-xl bg-white overflow-hidden">
        {/* <div className="bg-yellow-igreja px-2 py-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
          <span className="text-white font-semibold text-sm">Filtros selecionados</span>
        </div> */}
        <div className=" flex flex-col gap-2 text-sm">
          {(() => {
            const tipoCliente = filtrosAtivos.tipo_cliente;
            const dataMin = filtrosAtivos.data_hora_min;
            const dataMax = filtrosAtivos.data_hora_max;
            const precoMin = filtrosAtivos.preco_min;
            const precoMax = filtrosAtivos.preco_max;

            const formatarDataBR = (dt) => {
              if (!dt) return '';
              const dataStr = dt.includes(' ') ? dt.split(' ')[0] : dt;
              const partes = dataStr.split('-');
              return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dataStr;
            };

            const Badge = ({ label, value }) => (
              <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-2">
                <span className="text-gray-600 font-medium min-w-fit">{label}</span>
                <span className="text-gray-800 font-semibold">{value}</span>
              </div>
            );

            const itens = [];
            if (tipoCliente && tipoCliente.length > 0) {
              itens.push(<Badge key="tipo_cliente" label="Tipo de Cliente:" value={Array.isArray(tipoCliente) ? tipoCliente.join(', ') : tipoCliente} />);
            }
            if (saborFogazza && saborFogazza.length > 0) {
              itens.push(<Badge key="sabores" label="Sabores:" value={saborFogazza.join(', ')} />);
            }
            if (precoMin) {
              itens.push(<Badge key="preco_min" label="Valor Mínimo:" value={`R$ ${Number(precoMin).toFixed(2).replace('.', ',')}`} />);
            }
            if (precoMax) {
              itens.push(<Badge key="preco_max" label="Valor Máximo:" value={`R$ ${Number(precoMax).toFixed(2).replace('.', ',')}`} />);
            }
            if (dataMin || dataMax) {
              const periodo = `${formatarDataBR(dataMin)}${dataMin && dataMax ? ' a ' : ''}${formatarDataBR(dataMax)}`;
              itens.push(<Badge key="periodo" label="Período:" value={periodo} />);
            }
            if (itens.length === 0) {
              return <p className="text-gray-400 text-center py-2">Nenhum filtro selecionado.</p>;
            }
            return itens;
          })()}
        </div>
      </div>
      <div className="flex justify-center w-full">
        <button
          onClick={() => handleExportar("normal", usarFiltros ? filtrosAtivos : {})}
          className="flex-1 px-4 py-3 bg-green-igreja text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Exportar para Excel
          {/* <FaFileCsv size={102} className="text-green-700" /> */}
        </button>
      </div>

      {/* Tab agregado - comentado
      {tab === "agregado" && (
        <>
        <span className="text-slate-600 block mb-3">Selecione as datas e horários das missas:</span>

        <div className="flex gap-3 mb-4">
           <div className="flex-1 flex flex-col gap-2">
             <InputUnico
                nomeInput={""}
                type={"date"}
                classNameDiv={"w-full"}
                value={data1}
                onChange={e => setData1(e.target.value)}
              />
             <div className="flex gap-4 mt-1">
               <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                 <IconCheckboxes checked={missa1_11} onChange={e => setMissa1_11(e.target.checked)} title="11h" />
                 11h
               </label>
               <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                 <IconCheckboxes checked={missa1_17} onChange={e => setMissa1_17(e.target.checked)} title="17h" />
                 17h
               </label>
             </div>
           </div>

           <div className="flex-1 flex flex-col gap-2">
             <InputUnico
                nomeInput={""}
                type={"date"}
                classNameDiv={"w-full"}
                value={data2}
                onChange={e => setData2(e.target.value)}
              />
             <div className="flex gap-4 mt-1">
               <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                 <IconCheckboxes checked={missa2_11} onChange={e => setMissa2_11(e.target.checked)} title="11h" />
                 11h
               </label>
               <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                 <IconCheckboxes checked={missa2_17} onChange={e => setMissa2_17(e.target.checked)} title="17h" />
                 17h
               </label>
             </div>
           </div>
        </div>
        <div className="flex justify-center w-full">
          <button
            onClick={() => handleExportar("agregado", {
              data_1: data1 || undefined,
              data_2: data2 || undefined,
              missa_11_1: missa1_11,
              missa_17_1: missa1_17,
              missa_11_2: missa2_11,
              missa_17_2: missa2_17,
            })}
            className="flex-1 px-4 py-3 bg-green-igreja text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Exportar para Excel
          </button>
        </div>
        </>
      )}
      */}
    </>
  );
}