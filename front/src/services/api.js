const API_BASE_URL = 'http://127.0.0.1:5000'

// Função das requisições HTTP
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    const data = await response.json()

    if (data && data.erro) {
      throw new Error(data.erro)
    }

    return data
  } catch (error) {
    console.error('Erro na requisição:', error)
    throw error
  }
}

export const fogazzaService = {
  async listar() {
    return apiRequest('/fogazza/listar')
  },

  async adicionar(fogazzaData) {
    return apiRequest('/fogazza/adicionar', {
      method: 'POST',
      body: JSON.stringify(fogazzaData),
    })
  },

  async remover(idFogazza) {
    return apiRequest('/fogazza/remover', {
      method: 'DELETE',
      body: JSON.stringify({ id_fogazza: idFogazza }),
    })
  },
}

export const atendimentoService = {
  async adicionar(atendimentoData) {
    return apiRequest('/atendimento/adicionar', {
      method: 'POST',
      body: JSON.stringify(atendimentoData),
    })
  },

  async imprimir(idAtendimento, via) {
    return apiRequest('/atendimento/imprimir', {
      method: 'POST',
      body: JSON.stringify({ id_atendimento: idAtendimento, via: via }),
    })
  },

  async filtrar(filtros = {}) {
    return apiRequest('/atendimento/filtrar', {
      method: 'POST',
      body: JSON.stringify(filtros),
    })
  },

  async listarTodos() {
    return this.filtrar({
      pagina: 1,
      limit: 1000,
      order_by: "comprado_em",
      order_dir: "desc"
    })
  },

  async exportarRelatorio(filtros) {
    const response = await fetch(`${API_BASE_URL}/atendimento/imprimir-relatorio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filtros),
      mode: 'cors',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || 'Erro ao exportar relatório');
    }
    return response.blob();
  },

  async exportarRelatorioAgregado(filtros) {
    const response = await fetch(`${API_BASE_URL}/atendimento/imprimir-relatorio-agregado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filtros),
      mode: 'cors',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.erro || 'Erro ao exportar relatório agregado');
    }
    return response.blob();
  },
}



export default fogazzaService