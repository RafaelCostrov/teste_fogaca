import { useState } from "react";
import { motion } from "framer-motion";
import {Chart as ChartJS,ArcElement,Tooltip,Legend,} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CardVendaSabor({ dados = [], fogazzas = [], onSaborClick }) {
  const [loading, setLoading] = useState(false);



  const extrairSabor = (nomeFogazza) => {
    if (!nomeFogazza) return '';
    const nome = nomeFogazza.trim().toLowerCase();
    if (nome.includes('queijo')) return 'Queijo';
    if (nome.includes('calabresa')) return 'Calabresa';
    if (nome.includes('presunto')) return 'Presunto e Queijo';
    return nomeFogazza;
  };

  const gerarCoresGrafico = (quantidade, saboresPadronizados) => {
    const corPorSabor = {
      'Queijo': '#D1A24B',
      'Calabresa': '#056839',
      'Presunto e Queijo': '#B85C8A',
    };
    return saboresPadronizados.map(sabor => corPorSabor[sabor] || '#888888').slice(0, quantidade);
  };

  const processarDadosPorSabor = () => {
    const vendasPorSabor = {};
    dados.forEach(atendimento => {
      if (atendimento.itens && Array.isArray(atendimento.itens)) {
        atendimento.itens.forEach(item => {
          const fogazza = fogazzas.find(f => f.id_fogazza === item.id_fogazza);
          const nomeFogazza = fogazza ? fogazza.nome_fogazza : `${item.id_fogazza}`;
          const sabor = extrairSabor(nomeFogazza);
          const quantidade = item.quantidade || 0;
          if (vendasPorSabor[sabor]) {
            vendasPorSabor[sabor] += quantidade;
          } else {
            vendasPorSabor[sabor] = quantidade;
          }
        });
      }
    });
    const saboresOrdenados = Object.entries(vendasPorSabor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);
    return {
      labels: saboresOrdenados.map(([sabor]) => sabor),
      valores: saboresOrdenados.map(([, quantidade]) => quantidade)
    };
  };

  const dadosProcessados = processarDadosPorSabor();
  const cores = gerarCoresGrafico(dadosProcessados.labels.length, dadosProcessados.labels);

  const chartData = {
    labels: dadosProcessados.labels,
    datasets: [
      {
        data: dadosProcessados.valores,
        backgroundColor: cores,
        borderColor: cores.map(cor => cor + '80'), 
        borderWidth: 2,
        hoverBackgroundColor: cores.map(cor => cor + 'CC'),
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#374151',
          font: {
            family: 'Poppins',
            size: 12,
            weight: '500'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
       backgroundColor: '#D1A24B',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#D1A24B',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        titleFont: {
          family: 'Poppins',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Poppins',
          size: 12
        },
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const porcentagem = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} unidades (${porcentagem}%)`;
          }
        }
      }
    },
    cutout: '60%',
    elements: {
      arc: {
        borderRadius: 4
      }
    }
  };

  if (loading || fogazzas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded-full mx-auto w-64"></div>
        </div>
      </motion.div>
    );
  }



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
    >
      <h3 className="text-[18px] text-gray-600 mb-4 font-medium text-left font-poppins">
        Vendas por Sabor
      </h3>
      <div className="h-80 flex items-center  justify-center">
        {dadosProcessados.labels.length > 0 ? (
          <Doughnut 
            data={chartData} 
            options={options}
          />
        ) : (
          <div className="text-center text-gray-500">
            <p className="font-poppins">Nenhum dado disponível no filtro selecionado.</p>
          </div>
        )}
      </div>
      {dadosProcessados.labels.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 font-poppins">
            Total vendido: <span className="font-semibold">{dadosProcessados.valores.reduce((a, b) => a + b, 0)} unidades</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
