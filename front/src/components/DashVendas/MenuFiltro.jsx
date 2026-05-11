import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function MenuFiltro({
  isFiltered,
  onClick,
  onClear,
  filtrosAtivos,
  tipoCliente,
  setTipoCliente,
  saborFogazza,
  setSaborFogazza,
  fogazzas = [],
  valorMinimo,
  setValorMinimo,
  valorMaximo,
  setValorMaximo,
  dataMin,
  setDataMin,
  dataMax,
  setDataMax,
  InputUnico
}) {

  const [openTipoCliente, setOpenTipoCliente] = useState(false);
  const [openSaborFogazza, setOpenSaborFogazza] = useState(false);
  const tipoClienteRef = useRef(null);
  const saborFogazzaRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tipoClienteRef.current && !tipoClienteRef.current.contains(event.target)) {
        setOpenTipoCliente(false);
      }
      if (saborFogazzaRef.current && !saborFogazzaRef.current.contains(event.target)) {
        setOpenSaborFogazza(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-gray-100 border-x border-gray-300 p-4"
    >
      <div className="w-full flex flex-col md:flex-row md:flex-wrap gap-4 md:gap-3 mt-2 mb-4">
        {/* Dropdown custom Tipo de Cliente */}
        <div className="w-full md:flex-1 relative" ref={tipoClienteRef}>
          <label className="block mb-1 text-gray-600 font-medium text-sm">Tipo de Cliente</label>
          <div
            className="w-full border rounded p-2 flex items-center justify-between cursor-pointer bg-white"
            onClick={() => setOpenTipoCliente((v) => !v)}
            tabIndex={0}
          >
            <span className={"truncate text-sm text-gray-700"}>
              {tipoCliente.length > 0 ? tipoCliente.join(", ") : "Selecione..."}
            </span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${openTipoCliente ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          {openTipoCliente && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-auto">
              {[
                { value: "EQUIPE", label: "Equipe" },
                { value: "VISITANTE", label: "Visitante" },
                { value: "VOLUNTARIO", label: "Voluntário" },
              ].map(opt => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center ${tipoCliente.includes(opt.value) ? 'bg-blue-100 font-semibold' : ''}`}
                  onClick={() => {
                    if (tipoCliente.includes(opt.value)) {
                      setTipoCliente(tipoCliente.filter(v => v !== opt.value));
                    } else {
                      setTipoCliente([...tipoCliente, opt.value]);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={tipoCliente.includes(opt.value)}
                    readOnly
                    className="mr-2"
                  />
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Dropdown custom Sabor de Fogazza */}
        <div className="w-full md:flex-1 relative" ref={saborFogazzaRef}>
          <label className="block mb-1 text-gray-600 font-medium text-sm">Sabor de Fogazza</label>
          <div
            className="w-full border rounded p-2 flex items-center justify-between cursor-pointer bg-white"
            onClick={() => setOpenSaborFogazza((v) => !v)}
            tabIndex={0}
          >
            <span className={"truncate text-sm text-gray-700"}>
              {saborFogazza.length > 0 ? saborFogazza.join(", ") : "Selecione..."}
            </span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${openSaborFogazza ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          {openSaborFogazza && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-auto">
              {(fogazzas.length > 0 ? fogazzas : [
                { id_fogazza: 'queijo', nome_fogazza: 'Queijo' },
                { id_fogazza: 'calabresa', nome_fogazza: 'Calabresa' },
                { id_fogazza: 'presunto_queijo', nome_fogazza: 'Presunto e Queijo' }
              ]).map(f => (
                <div
                  key={f.id_fogazza}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center ${saborFogazza.includes(f.nome_fogazza) ? 'bg-blue-100 font-semibold' : ''}`}
                  onClick={() => {
                    if (saborFogazza.includes(f.nome_fogazza)) {
                      setSaborFogazza(saborFogazza.filter(v => v !== f.nome_fogazza));
                    } else {
                      setSaborFogazza([...saborFogazza, f.nome_fogazza]);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={saborFogazza.includes(f.nome_fogazza)}
                    readOnly
                    className="mr-2"
                  />
                  {f.nome_fogazza}
                </div>
              ))}
            </div>
          )}
        </div>
        {InputUnico && (
          <>
            <InputUnico
              nomeInput={"Valor Mínimo"}
              placeholder={"R$ 0,00"}
              type={"text"}
              classNameDiv={"md:col-start-2 md:row-start-1"}
              value={valorMinimo}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, "");
                v = (Number(v) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                setValorMinimo(v);
              }}
              inputMode="decimal"
              maxLength={15}
            />
            <InputUnico
              nomeInput={"Valor Máximo"}
              placeholder={"R$ 100,00"}
              type={"text"}
              classNameDiv={"md:col-start-3 md:row-start-1"}
              value={valorMaximo}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, "");
                v = (Number(v) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
                setValorMaximo(v);
              }}
              inputMode="decimal"
              maxLength={15}
            />
            <InputUnico
              nomeInput={"Data Mínima"}
              type={"date"}
              classNameDiv={"md:col-start-4 md:row-start-1"}
              value={dataMin}
              onChange={e => setDataMin(e.target.value)}
            />
            <InputUnico
              nomeInput={"Data Máxima"}
              type={"date"}
              classNameDiv={"md:col-start-5 md:row-start-1"}
              value={dataMax}
              onChange={e => setDataMax(e.target.value)}
            />
          </>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onClick}
          className="px-4 py-2 bg-green-igreja text-white rounded hover:bg-yellow-igreja transition-colors"
        >
          Aplicar Filtros
        </button>
        {filtrosAtivos && (
          <button
            onClick={() => {
              setTipoCliente([]);
              setSaborFogazza([]);
              setValorMinimo("");
              setValorMaximo("");
              setDataMin("");
              setDataMax("");
              if (onClear) onClear();
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>
    </motion.div>
  );
}