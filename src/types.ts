export interface Endereco {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export interface HistoricoItem {
  id: string
  cep: string
  cidade: string
  uf: string
  logradouro: string
  data: string
}

export interface ClimaData {
  cidade: string
  estado: string
  temperatura: number
  sensacao: number
  umidade: number
  vento: number
  codigoClima: number
  isDay: boolean
}
