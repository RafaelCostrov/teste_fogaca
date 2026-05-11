import { useState } from "react";
import { motion } from "framer-motion";
import {Chart as ChartJS,CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend);

export default function CardVendaQtd({ dados = [], fogazzas = [], onClickPoint }) {
  const [loading, setLoading] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState('TODAS'); 


  const processarDadosPorHora = () => {
    if (modoVisualizacao === 'TODAS') {
      const vendasPorHora = Array(24).fill(0);
      dados.forEach(atendimento => {
        if (atendimento.comprado_em && atendimento.itens) {
          const data = new Date(atendimento.comprado_em);
          const hora = data.getHours();
          const totalQtd = atendimento.itens.reduce((acc, item) => acc + (item.quantidade || 0), 0);
          vendasPorHora[hora] += totalQtd;
        }
      });
      return { 'Todas as Vendas': vendasPorHora };
    } else {
      const saboresData = {};
      fogazzas.forEach(fogazza => {
        saboresData[fogazza.nome_fogazza] = Array(24).fill(0);
      });
      dados.forEach(atendimento => {
        if (atendimento.comprado_em && atendimento.itens) {
          const data = new Date(atendimento.comprado_em);
          const hora = data.getHours();
          atendimento.itens.forEach(item => {
            const fogazza = fogazzas.find(f => f.id_fogazza === item.id_fogazza);
            if (fogazza) {
              const nomeFogazza = fogazza.nome_fogazza;
              saboresData[nomeFogazza][hora] += item.quantidade || 0;
            }
          });
        }
      });
      return saboresData;
    }
  };

  const gerarLabelsHoras = () => {
    return Array.from({ length: 24 }, (_, i) => {
      return `${i.toString().padStart(2, '0')}:00`;
    });
  };

  const saboresData = processarDadosPorHora();
  const labels = gerarLabelsHoras();

  const coresSabores = {
    'Todas as Vendas': {
      border: '#D1A24B',
      background: 'rgba(209, 162, 75, 0.08)'
    },
    'Fogazza Queijo': {
      border: '#D1A24B',
      background: 'rgba(209, 162, 75, 0.08)'
    },
    'Fogazza Calabresa': {
      border: '#056839', 
      background: 'rgba(5, 104, 57, 0.08)'
    },
    'Fogazza Presunto e Queijo': {
      border: '#973E36',
      background: 'rgba(151, 62, 54, 0.08)'
    }
  };

  const datasets = Object.keys(saboresData).map(nomeSabor => {
    const cores = coresSabores[nomeSabor] || {
      border: '#8B5A3C',
      background: 'rgba(139, 90, 60, 0.08)'
    };
    
    return {
      label: nomeSabor,
      data: saboresData[nomeSabor],
      borderColor: cores.border,
      backgroundColor: cores.background,
      borderWidth: 2.5,
      fill: true,
      tension: 0.35,
      pointBackgroundColor: cores.border,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: cores.border,
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3,
    };
  });

  const chartData = {
    labels: labels,
    datasets: datasets,
  };



  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    plugins: {
      legend: {
        display: modoVisualizacao === 'POR_SABOR',
        position: 'bottom',
        align: 'center',
        borderRadius: 6,
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: '500',
            family: 'Poppins'
          },
          padding: 10,
          usePointStyle: true,
          pointStyle: 'rectRounded'
        }
      },
      title: {
        display: false,  
      },
      tooltip: {
        backgroundColor: '#056839',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#056839',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: modoVisualizacao === 'POR_SABOR',
        titleFont: {
          family: 'Poppins',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Poppins',
          size: 14
        },
        callbacks: {
          label: function(context) {
            const valor = context.parsed.y;
            const label = modoVisualizacao === 'POR_SABOR' ? `${context.dataset.label}: ` : '';
            return `${label}${valor} unidade${valor === 1 ? '' : 's'}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.15)',
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 10,
            weight: '400',
            family: 'Poppins'
          },
          maxTicksLimit: 6,
          callback: function(value) {
            return `${value} un.`;
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.15)',
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
            weight: '400',
            family: 'Poppins'
          },
          maxTicksLimit: 8,
          callback: function(value, index) {
            //config dos horarios
            if (index % 3 === 0 || index === this.chart.scales.x.ticks.length - 1) {
              return this.getLabelForValue(value);
            }
            return '';
          }
        }
      },
    },
  };

  if (loading || fogazzas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md flex flex-col h-full"
      >
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
        </div>
        <div className="flex-1 p-3 md:p-4 min-h-0">
          <div className="h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[350px] bg-gray-100 rounded animate-pulse flex items-center justify-center">
            <div className="text-gray-400 font-poppins text-sm">Carregando gráfico...</div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
    >
      <div className="px-4 pt-4 pb-2 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base md:text-lg font-medium text-gray-600 font-poppins">
          Quantidade vendida por horário
        </h3>
        
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setModoVisualizacao('TODAS')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
              modoVisualizacao === 'TODAS'
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            TODAS
          </button>
          <button
            onClick={() => setModoVisualizacao('POR_SABOR')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
              modoVisualizacao === 'POR_SABOR'
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            POR SABOR
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-3 md:p-4 min-h-0">
        <div className="h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[350px]">
          <Line data={chartData} options={options} />
        </div>
      </div>
    </motion.div>
  );
}
