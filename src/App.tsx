import { useState, type FormEvent } from 'react'
import { centavos, parcelas, resumo, transferencias, type Encontro } from './rateio'
import './style.css'

const chave = 'rateio-claro-v1'
const moeda = (n: number) => (n / 100).toLocaleString('pt-BR', {style:'currency', currency:'BRL'})
function carregar(): Encontro | null {
  try { return JSON.parse(localStorage.getItem(chave) ?? 'null') } catch { return null }
}
export default function App() {
  const [encontro, atualizar] = useState(carregar)
  const [erro, informar] = useState('')
  const [modo, dividir] = useState('igual')
  function salvar(proximo: Encontro) {
    localStorage.setItem(chave, JSON.stringify(proximo))
    atualizar(proximo)
  }
  function enviar(acao: (dados: FormData) => void) {
    return (evento: FormEvent<HTMLFormElement>) => {
      evento.preventDefault()
      try {
        acao(new FormData(evento.currentTarget))
        evento.currentTarget.reset()
        informar('')
      } catch(e) { informar(e instanceof Error ? e.message : 'Falha ao salvar.') }
    }
  }
  function nome(d: FormData, campo: string) {
    const valor = String(d.get(campo) ?? '').trim()
    if (!valor) throw Error('Preencha o nome ou a descrição.')
    return valor
  }
  const linhas = encontro ? resumo(encontro) : []
  const acertos = transferencias(linhas)
  return <main><header>Rateio Claro</header>{erro && <p role="alert">{erro}</p>}
    {!encontro ? <section><h1>Dividir despesas</h1><p>Crie um encontro para registrar quem pagou e quem participou de cada despesa.</p>
      <form onSubmit={enviar(d => salvar({nome:nome(d,'nome'), pessoas:[], despesas:[]}))}>
        <label>Nome do encontro<input name="nome" required placeholder="Almoço de domingo"/></label><button>Criar encontro</button>
      </form></section> : <>
    <h1>{encontro.nome}</h1><p>Encontro salvo neste navegador.</p>
    <div className="grid"><section><h2>Participantes</h2><ul>{encontro.pessoas.map(p => <li key={p.id}>{p.nome}</li>)}</ul>
      <form onSubmit={enviar(d => {
        const novo = nome(d,'pessoa')
        if (encontro.pessoas.some(p => p.nome.toLocaleLowerCase('pt-BR') === novo.toLocaleLowerCase('pt-BR'))) throw Error('Esse participante já está no encontro.')
        salvar({...encontro, pessoas:[...encontro.pessoas,{id:crypto.randomUUID(),nome:novo}]})
      })}><label>Nome do participante<input name="pessoa" required/></label><button>Adicionar participante</button></form>
    </section><section><h2>Nova despesa</h2>{encontro.pessoas.length === 0 ? <p>Adicione um participante para começar.</p> :
      <form onSubmit={enviar(d => {
        const valor = centavos(String(d.get('valor')))
        const pesos = Object.fromEntries(encontro.pessoas.filter(p => d.has(p.id)).map(p => [p.id, modo === 'igual' ? 1 : Number(d.get('q'+p.id))]))
        parcelas(valor,pesos)
        salvar({...encontro,despesas:[...encontro.despesas,{descricao:nome(d,'descricao'),valor,pesos,pagador:String(d.get('pagador'))}]})
        dividir('igual')
      })}><label>Descrição<input name="descricao" required/></label><label>Valor (R$)<input name="valor" inputMode="decimal" required/></label>
      <label>Quem pagou<select name="pagador">{encontro.pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
      <label>Divisão<select value={modo} onChange={e => dividir(e.target.value)}><option value="igual">Igual</option><option value="quantidade">Por quantidade</option></select></label>
      <fieldset><legend>Quem consumiu</legend>{encontro.pessoas.map(p => <div key={p.id}><label className="inline"><input type="checkbox" name={p.id} defaultChecked/>{p.nome}</label>{modo === 'quantidade' && <label>Quantidade de {p.nome}<input type="number" name={'q'+p.id} defaultValue="1"/></label>}</div>)}</fieldset>
      <button>Registrar despesa</button></form>}</section></div>
    <section><h2>Despesas</h2>{!encontro.despesas.length && <p>Nenhuma despesa registrada.</p>}<ul>{encontro.despesas.map((d,i) => <li key={i}>{d.descricao} · {moeda(d.valor)} · pago por {encontro.pessoas.find(p => p.id === d.pagador)?.nome}</li>)}</ul></section>
    <section><h2>Saldos</h2><table><thead><tr>{['Pessoa','Pagou','Consumiu','Saldo'].map(t => <th key={t}>{t}</th>)}</tr></thead><tbody>{linhas.map(p => <tr key={p.id}><td>{p.nome}</td><td>{moeda(p.pago)}</td><td>{moeda(p.consumo)}</td><td>{moeda(p.saldo)}</td></tr>)}</tbody></table>
    <h2>Acerto de contas</h2>{acertos.length ? <ul>{acertos.map((a,i) => <li key={i}>{a.de} transfere {moeda(a.valor)} para {a.para}</li>)}</ul> : <p>Nenhuma transferência necessária.</p>}</section>
    <button onClick={() => {if(window.confirm('Apagar este encontro e começar outro?')) {localStorage.removeItem(chave); atualizar(null); informar(''); dividir('igual')}}}>Começar outro encontro</button></>}</main>
}
