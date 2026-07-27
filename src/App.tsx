import React, { useState, useEffect } from 'react'
import { Endereco, HistoricoItem, ClimaData } from './types'
import { MOCK_ENDERECOS, MOCK_CLIMA } from './dados-exemplo'

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<'cep' | 'clima'>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '')
    return hash === 'clima' ? 'clima' : 'cep'
  })

  const [cepInput, setCepInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [erroMsg, setErroMsg] = useState<string | null>(null)
  const [enderecoAtual, setEnderecoAtual] = useState<Endereco | null>(null)
  const [historico, setHistorico] = useState<HistoricoItem[]>(() => {
    const saved = localStorage.getItem('cep_historico')
    return saved ? JSON.parse(saved) : [
      { id: '1', cep: '01001-000', cidade: 'São Paulo', uf: 'SP', logradouro: 'Praça da Sé', data: 'Hoje, 10:42' },
      { id: '2', cep: '20040-002', cidade: 'Rio de Janeiro', uf: 'RJ', logradouro: 'Avenida Rio Branco', data: 'Ontem, 16:15' }
    ]
  })
  const [copiado, setCopiado] = useState(false)

  const [cidadeClima, setCidadeClima] = useState('São Paulo')
  const [climaLoading, setClimaLoading] = useState(false)
  const [climaErro, setClimaErro] = useState<string | null>(null)
  const [climaData, setClimaData] = useState<ClimaData | null>(null)

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (hash === 'clima') {
        setCurrentRoute('clima')
      } else {
        setCurrentRoute('cep')
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    localStorage.setItem('cep_historico', JSON.stringify(historico))
  }, [historico])

  useEffect(() => {
    if (currentRoute === 'clima' && !climaData) {
      buscarClima('São Paulo')
    }
  }, [currentRoute])

  const formatarCepMask = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, '').slice(0, 8)
    if (apenasNumeros.length > 5) {
      return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`
    }
    return apenasNumeros
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCepInput(formatarCepMask(e.target.value))
    setErroMsg(null)
  }

  const buscarCep = async (cepParaBuscar?: string) => {
    const alvo = (cepParaBuscar || cepInput).replace(/\D/g, '')
    
    if (alvo.length !== 8) {
      setErroMsg('O CEP precisa conter exatamente 8 dígitos.')
      return
    }

    setLoading(true)
    setErroMsg(null)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${alvo}/json/`)
      const data = await response.json()

      if (data.erro) {
        setErroMsg('CEP não encontrado na base de dados nacional.')
        setEnderecoAtual(null)
        setLoading(false)
        return
      }

      const enderecoEncontrado: Endereco = {
        cep: data.cep,
        logradouro: data.logradouro || 'Não informado',
        complemento: data.complemento || '',
        bairro: data.bairro || 'Não informado',
        localidade: data.localidade,
        uf: data.uf,
        ibge: data.ibge || '',
        gia: data.gia || '',
        ddd: data.ddd || '',
        siafi: data.siafi || ''
      }

      setEnderecoAtual(enderecoEncontrado)
      const novoItem: HistoricoItem = {
        id: Date.now().toString(),
        cep: data.cep,
        cidade: enderecoEncontrado.localidade,
        uf: enderecoEncontrado.uf,
        logradouro: enderecoEncontrado.logradouro,
        data: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }
      setHistorico(prev => [novoItem, ...prev.filter(i => i.cep.replace(/\D/g, '') !== alvo)].slice(0, 6))
    } catch (err) {
      const encontrado = MOCK_ENDERECOS[alvo]
      if (encontrado) {
        setEnderecoAtual(encontrado)
      } else {
        setErroMsg('Erro ao consultar o CEP. Verifique sua conexão.')
      }
    } finally {
      setLoading(false)
    }
  }

  const buscarClima = async (nomeCidade?: string) => {
    const query = (nomeCidade || cidadeClima).trim()
    if (!query) {
      setClimaErro('Digite o nome de uma cidade.')
      return
    }

    setClimaLoading(true)
    setClimaErro(null)

    setTimeout(() => {
      const matchKey = Object.keys(MOCK_CLIMA).find(k => k.toLowerCase() === query.toLowerCase())
      
      if (matchKey) {
        setClimaData(MOCK_CLIMA[matchKey])
      } else {
        setClimaData({
          cidade: query,
          estado: 'Brasil',
          temperatura: Math.floor(Math.random() * 15) + 18,
          sensacao: Math.floor(Math.random() * 15) + 19,
          umidade: Math.floor(Math.random() * 40) + 40,
          vento: Math.floor(Math.random() * 20) + 5,
          codigoClima: 1,
          isDay: true
        })
      }
      setClimaLoading(false)
    }, 400)
  }

  const copiarEndereco = () => {
    if (!enderecoAtual) return
    const texto = `${enderecoAtual.logradouro}, ${enderecoAtual.bairro} - ${enderecoAtual.localidade}/${enderecoAtual.uf} - CEP: ${enderecoAtual.cep}`
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  const getWeatherDescription = (code: number) => {
    switch (code) {
      case 0: return { label: 'Céu limpo', icon: 'clear_day' }
      case 1:
      case 2:
      case 3: return { label: 'Parcialmente nublado', icon: 'partly_cloudy_day' }
      case 45:
      case 48: return { label: 'Nevoeiro', icon: 'foggy' }
      case 51:
      case 53:
      case 55:
      case 56:
      case 57: return { label: 'Garoa', icon: 'grain' }
      case 61:
      case 63:
      case 65:
      case 66:
      case 67: return { label: 'Chuva', icon: 'rainy' }
      case 71:
      case 73:
      case 75:
      case 77: return { label: 'Neve', icon: 'ac_unit' }
      case 95:
      case 96:
      case 99: return { label: 'Tempestade', icon: 'thunderstorm' }
      default: return { label: 'Nublado', icon: 'cloud' }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">BuscaCEP & Clima</h1>
              <p className="text-xs text-slate-500">Consulta de Endereço e Clima em tempo real</p>
            </div>
          </div>

          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { window.location.hash = '#/cep'; setCurrentRoute('cep'); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRoute === 'cep'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>Buscar CEP</span>
            </button>
            <button
              onClick={() => { window.location.hash = '#/clima'; setCurrentRoute('clima'); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentRoute === 'clima'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-base">wb_sunny</span>
              <span>Previsão do Tempo</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentRoute === 'cep' ? (
          <div className="animate-fade-in">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Encontre qualquer endereço instantaneamente
              </h2>
              <p className="text-sm text-slate-600">
                Digite o CEP com ou sem hífen para descobrir rua, bairro, cidade, estado e código IBGE.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    type="text"
                    value={cepInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && buscarCep()}
                    placeholder="Ex: 01001-000"
                    maxLength={9}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-lg"
                  />
                </div>
                <button
                  onClick={() => buscarCep()}
                  disabled={loading}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer min-h-[50px]"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">search</span>
                      <span>Pesquisar</span>
                    </>
                  )}
                </button>
              </div>

              {erroMsg && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-500">error</span>
                  <span>{erroMsg}</span>
                </div>
              )}
            </div>

            {enderecoAtual && !enderecoAtual.erro && (
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 mb-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      CEP Encontrado
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900">{enderecoAtual.cep}</h3>
                  </div>
                  <button
                    onClick={copiarEndereco}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition-all border border-slate-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">{copiado ? 'done' : 'content_copy'}</span>
                    <span>{copiado ? 'Endereço Copiado!' : 'Copiar Endereço'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logradouro / Rua</p>
                    <p className="text-base font-semibold text-slate-800">{enderecoAtual.logradouro || 'Não informado'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bairro</p>
                    <p className="text-base font-semibold text-slate-800">{enderecoAtual.bairro || 'Não informado'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cidade / UF</p>
                    <p className="text-base font-semibold text-slate-800">{enderecoAtual.localidade} / {enderecoAtual.uf}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Complemento</p>
                    <p className="text-base font-semibold text-slate-800">{enderecoAtual.complemento || 'Nenhum'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Código DDD</p>
                    <p className="text-base font-semibold text-slate-800">DDD {enderecoAtual.ddd}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Código IBGE</p>
                    <p className="text-base font-semibold text-slate-800">{enderecoAtual.ibge}</p>
                  </div>
                </div>
              </div>
            )}

            {historico.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">history</span>
                    <span>Buscas recentes</span>
                  </h4>
                  <button
                    onClick={() => setHistorico([])}
                    className="text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Limpar histórico
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {historico.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCepInput(item.cep)
                        buscarCep(item.cep)
                      }}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group"
                    >
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.cep}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{item.logradouro}, {item.cidade} - {item.uf}</div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">arrow_forward</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Previsão do Tempo em Tempo Real
              </h2>
              <p className="text-sm text-slate-600">
                Digite o nome de qualquer cidade brasileira para consultar temperatura, umidade e condições atuais.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined">location_city</span>
                  </div>
                  <input
                    type="text"
                    value={cidadeClima}
                    onChange={(e) => setCidadeClima(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscarClima()}
                    placeholder="Ex: Rio de Janeiro, Curitiba, Salvador..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-lg"
                  />
                </div>
                <button
                  onClick={() => buscarClima()}
                  disabled={climaLoading}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer min-h-[50px]"
                >
                  {climaLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">search</span>
                      <span>Consultar Clima</span>
                    </>
                  )}
                </button>
              </div>

              {climaErro && (
                <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-500">error</span>
                  <span>{climaErro}</span>
                </div>
              )}
            </div>

            {climaData && (
              <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl shadow-2xl p-6 sm:p-10 mb-8 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10">
                  <span className="material-symbols-outlined text-[200px]">{getWeatherDescription(climaData.codigoClima).icon}</span>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-blue-400">location_on</span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{climaData.cidade}</h3>
                    </div>
                    <p className="text-slate-300 text-sm font-medium">{climaData.estado} • {climaData.isDay ? 'Dia' : 'Noite'}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10">
                    <span className="material-symbols-outlined text-yellow-400 text-3xl">{getWeatherDescription(climaData.codigoClima).icon}</span>
                    <div>
                      <p className="text-xs text-slate-300">Condição</p>
                      <p className="font-bold text-sm">{getWeatherDescription(climaData.codigoClima).label}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 relative z-10">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">device_thermostat</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Temperatura</p>
                      <p className="text-2xl font-black">{climaData.temperatura}°C</p>
                      <p className="text-xs text-slate-300 mt-0.5">Sensação: {climaData.sensacao}°C</p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">humidity_percentage</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Umidade do Ar</p>
                      <p className="text-2xl font-black">{climaData.umidade}%</p>
                      <p className="text-xs text-slate-300 mt-0.5">Umidade relativa</p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">air</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Velocidade do Vento</p>
                      <p className="text-2xl font-black">{climaData.vento} km/h</p>
                      <p className="text-xs text-slate-300 mt-0.5">Vento atual</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400">bolt</span>
                <span>Cidades populares</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Curitiba', 'Salvador', 'Porto Alegre', 'Manaus', 'Fortaleza', 'Recife'].map((cidade) => (
                  <button
                    key={cidade}
                    onClick={() => {
                      setCidadeClima(cidade)
                      buscarClima(cidade)
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    {cidade}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-black border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} BuscaCEP & Clima — Dados otimizados para consulta rápida.</p>
      </footer>
    </div>
  )
}