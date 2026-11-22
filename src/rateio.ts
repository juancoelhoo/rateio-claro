export type Pessoa = { id: string; nome: string };
export type Despesa = {
  descricao: string;
  valor: number;
  pagador: string;
  pesos: Record<string, number>;
};
export type Encontro = { nome: string; pessoas: Pessoa[]; despesas: Despesa[] };

export function centavos(texto: string) {
  if (!/^\d{1,8}([.,]\d{1,2})?$/.test(texto.trim()))
    throw Error("Informe um valor positivo com até duas casas decimais.");
  const [inteiro, decimal = ""] = texto.trim().split(/[.,]/);
  const valor = Number(inteiro) * 100 + Number(decimal.padEnd(2, "0"));
  if (!valor) throw Error("O valor deve ser maior que zero.");
  return valor;
}

// Distribui centavos restantes pelas maiores frações. Empates seguem a ordem de cadastro.
export function parcelas(valor: number, pesos: Record<string, number>) {
  const entradas = Object.entries(pesos);
  if (!Number.isSafeInteger(valor) || valor <= 0 || valor > 9999999999)
    throw Error("Valor inválido.");
  if (
    !entradas.length ||
    entradas.some(([, p]) => !Number.isInteger(p) || p < 1 || p > 9999)
  )
    throw Error("Selecione consumidores com quantidades entre 1 e 9999.");
  const total = entradas.reduce((s, [, p]) => s + p, 0);
  const partes = entradas.map(([id, p]) => ({
    id,
    parte: Math.floor((valor * p) / total),
    resto: (valor * p) % total,
  }));
  const sobra = valor - partes.reduce((s, item) => s + item.parte, 0);
  partes.sort((a, b) => b.resto - a.resto);
  return Object.fromEntries(
    partes.map(({ id, parte }, i) => [id, parte + Number(i < sobra)]),
  );
}

export function resumo({ pessoas, despesas }: Encontro) {
  const linhas = pessoas.map((p) => ({ ...p, pago: 0, consumo: 0, saldo: 0 }));
  for (const d of despesas) {
    const partes = parcelas(d.valor, d.pesos);
    for (const linha of linhas) {
      if (linha.id === d.pagador) linha.pago += d.valor;
      linha.consumo += partes[linha.id] ?? 0;
      linha.saldo = linha.pago - linha.consumo;
    }
  }
  return linhas;
}

export function transferencias(linhas: ReturnType<typeof resumo>) {
  const creditos = linhas.filter((p) => p.saldo > 0).map((p) => ({ ...p }));
  const sugestoes = [];
  let i = 0;
  for (const pessoa of linhas) {
    let divida = -pessoa.saldo;
    while (divida > 0) {
      const credor = creditos[i];
      const valor = Math.min(divida, credor.saldo);
      sugestoes.push({ de: pessoa.nome, para: credor.nome, valor });
      divida -= valor;
      credor.saldo -= valor;
      if (!credor.saldo) i++;
    }
  }
  return sugestoes;
}
