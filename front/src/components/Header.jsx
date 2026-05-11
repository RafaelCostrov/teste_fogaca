import { Link, useLocation } from "react-router-dom";
import { TbFileAnalytics, TbChartBar, TbHome } from "react-icons/tb";

function Header() {
  const location = useLocation();

  return (
    <header className="bg-red-igreja text-white">
      <div className="mx-auto flex min-h-20 w-full items-center justify-between px-6 py-4">
        <div className="w-32">
          <img
            src="/images/saoJudas.png"
            alt="Logo Santuário São Judas Tadeu"
            className="h-28 w-28 object-contain"
          />
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-semibold text-yellow-igreja">Santuário São Judas Tadeu</h1>
          <p className="text-xl text-white/90">Controle de Vendas</p>
        </div>
        <div className="w-32 flex justify-end gap-4">
          
          {/* Botão Dashboard */}
          <Link 
            to="/dashboard" 
            className={`text-4xl transition-colors hover:text-yellow-300 ${
              location.pathname === '/dashboard' ? 'text-yellow-igreja' : 'text-white/70'
            }`}
            title="Dashboard"
          >
            <TbFileAnalytics />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header
