import { Endereco, ClimaData } from './types'

export const MOCK_ENDERECOS: Record<string, Endereco> = {
  '01001000': {
    cep: '01001-000',
    logradouro: 'Praça da Sé',
    complemento: 'lado ímpar',
    bairro: 'Sé',
    localidade: 'São Paulo',
    uf: 'SP',
    ibge: '3550308',
    gia: '1004',
    ddd: '11',
    siafi: '7107'
  },
  '20040002': {
    cep: '20040-002',
    logradouro: 'Avenida Rio Branco',
    complemento: 'até 159 - lado par',
    bairro: 'Centro',
    localidade: 'Rio de Janeiro',
    uf: 'RJ',
    ibge: '3304557',
    gia: '',
    ddd: '21',
    siafi: '6001'
  },
  '30110012': {
    cep: '30110-012',
    logradouro: 'Avenida Afonso Pena',
    complemento: 'até 980 - lado par',
    bairro: 'Centro',
    localidade: 'Belo Horizonte',
    uf: 'MG',
    ibge: '3106200',
    gia: '',
    ddd: '31',
    siafi: '5107'
  }
}

export const MOCK_CLIMA: Record<string, ClimaData> = {
  'São Paulo': {
    cidade: 'São Paulo',
    estado: 'São Paulo',
    temperatura: 24,
    sensacao: 25,
    umidade: 68,
    vento: 12,
    codigoClima: 1,
    isDay: true
  },
  'Rio de Janeiro': {
    cidade: 'Rio de Janeiro',
    estado: 'Rio de Janeiro',
    temperatura: 31,
    sensacao: 35,
    umidade: 72,
    vento: 15,
    codigoClima: 0,
    isDay: true
  },
  'Belo Horizonte': {
    cidade: 'Belo Horizonte',
    estado: 'Minas Gerais',
    temperatura: 26,
    sensacao: 27,
    umidade: 55,
    vento: 10,
    codigoClima: 2,
    isDay: true
  },
  'Brasília': {
    cidade: 'Brasília',
    estado: 'Distrito Federal',
    temperatura: 28,
    sensacao: 29,
    umidade: 45,
    vento: 14,
    codigoClima: 1,
    isDay: true
  },
  'Curitiba': {
    cidade: 'Curitiba',
    estado: 'Paraná',
    temperatura: 19,
    sensacao: 18,
    umidade: 80,
    vento: 18,
    codigoClima: 61,
    isDay: true
  },
  'Salvador': {
    cidade: 'Salvador',
    estado: 'Bahia',
    temperatura: 29,
    sensacao: 32,
    umidade: 78,
    vento: 16,
    codigoClima: 3,
    isDay: true
  },
  'Porto Alegre': {
    cidade: 'Porto Alegre',
    estado: 'Rio Grande do Sul',
    temperatura: 22,
    sensacao: 22,
    umidade: 65,
    vento: 12,
    codigoClima: 0,
    isDay: true
  },
  'Manaus': {
    cidade: 'Manaus',
    estado: 'Amazonas',
    temperatura: 32,
    sensacao: 38,
    umidade: 85,
    vento: 8,
    codigoClima: 63,
    isDay: true
  },
  'Fortaleza': {
    cidade: 'Fortaleza',
    estado: 'Ceará',
    temperatura: 30,
    sensacao: 34,
    umidade: 75,
    vento: 20,
    codigoClima: 1,
    isDay: true
  },
  'Recife': {
    cidade: 'Recife',
    estado: 'Pernambuco',
    temperatura: 29,
    sensacao: 33,
    umidade: 77,
    vento: 17,
    codigoClima: 61,
    isDay: true
  }
}
