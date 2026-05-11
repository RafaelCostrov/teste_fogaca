import { TbFileAnalytics } from "react-icons/tb";
import { IoArrowBack } from "react-icons/io5";


function HeaderVendas({ paginaAtual = 'vendas', onNavigate }) {
  const handleNavigateToRelatorios = () => {
    if (onNavigate) {
      onNavigate('relatorios')
    }
  }

  const handleNavigateToVendas = () => {
    if (onNavigate) {
      onNavigate('vendas')
    }
  }

  return (
    <header className="bg-red-igreja text-white">
      <div className="mx-auto flex min-h-10 w-full items-center justify-between px-8 py-4">
        <div className="flex justify-start text-2xl cursor-pointer transition-all duration-300 text-yellow-igreja hover:text-white hover:scale-105" title="Voltar">
            <IoArrowBack onClick={handleNavigateToVendas}/>
        </div>
        
        <div className="flex-1 text-center">
          <h1 
            className="text-2xl font-semibold text-yellow-igreja cursor-pointer" 
            onClick={handleNavigateToVendas}
          >
            Santuário São Judas Tadeu
          </h1>
          <p className="text-sm text-white/90">
            {paginaAtual === 'vendas' ? 'Controle de Vendas' : 'Relatório de Vendas'}
          </p>
        </div>
       <div className="w-16">
          <img
            src="/images/saoJudas.png"
            alt="Logo Santuário São Judas Tadeu"
            className="h-12 w-12 object-contain cursor-pointer"
            onClick={handleNavigateToVendas}
          />
        </div>
      </div>
    </header>
  )
}

export default HeaderVendas
