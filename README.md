# Rateio Claro

## Integrantes

1. Nome completo a preencher
2. Nome completo a preencher
3. Nome completo a preencher

## Sobre o sistema

Crie um encontro, adicione participantes e registre quanto cada pessoa pagou. Para cada despesa, marque quem consumiu e escolha divisão igual ou por quantidade. O resumo mostra pagamento, consumo, saldo e transferências sugeridas. O encontro fica salvo no navegador. Começar outro encontro pede confirmação e substitui o atual.

Os cálculos usam centavos inteiros. No rateio proporcional, os centavos restantes vão para as maiores frações, com desempate pela ordem de cadastro. Por exemplo, R$ 10,00 para três consumidores em partes iguais resulta em R$ 3,34, R$ 3,33 e R$ 3,33.

## Tecnologias

React e TypeScript compõem a interface e as regras de negócio. Vite gera o site estático. Vitest e V8 verificam comportamentos e cobertura. Playwright executa jornadas no Chromium.

## Uso de IA

O Codex auxiliou na escolha do tema, na implementação da interface e dos cálculos, na configuração do workflow e na escrita dos testes iniciais. Cada integrante deve complementar esta seção com sua própria utilização durante o trabalho.

## Execução dos testes

Use Node.js 22.12 ou superior da série 22. No diretório do projeto, execute:

```sh
npm ci
npm test
npm run coverage
npx playwright install --with-deps chromium
npm run e2e
npm run build
```

Para usar o sistema, execute `npm run dev` e abra o endereço exibido. O build de produção fica em `dist/`. A cobertura considera a interface e o domínio, excluindo apenas o ponto de montagem React. O workflow exige 80% de linhas, funções, instruções e ramificações.

## Testes reservados para o grupo

A base contém **9 testes unitários de domínio, 2 testes de integração da interface e 1 e2e**. Contando as categorias separadamente, faltam **41 unitários e 4 e2e**. Os agrupamentos abaixo são uma sugestão de divisão por comportamentos.

| Responsável | Unitários restantes | E2E restantes |
|---|---|---|
| Integrante 2 | 21 sobre entrada de valores e parcelas. Cobrir inteiros, espaços externos, vírgula e ponto, menor e maior valor, valores negativos ou malformados, pesos fracionários, nulos ou excessivos, consumidor único, distribuição exata, vários centavos restantes e quantidades distintas. | 1. Dividir bebidas apenas entre quem consumiu. 2. Registrar consumo por quantidade e conferir as parcelas. |
| Integrante 3 | 20 sobre saldos e transferências. Cobrir encontro vazio, pessoa sem consumo, pagador que também consumiu, múltiplas despesas e pagadores, saldo quitado, créditos e débitos parciais, um devedor com vários credores, vários devedores com um credor, conservação dos totais e quitação de cada saldo após as sugestões. | 3. Registrar despesas pagas por pessoas diferentes e conferir o acerto. 4. Reabrir o encontro após recarregar a página e conferir despesas e saldos. |

Cada integrante deve criar os casos em sua branch, com commits pequenos por comportamento e revisão por outra pessoa. A meta de 50 commits vale para o projeto completo.

## CI e publicação

O workflow de build roda em push e pull request, nos runners Ubuntu, macOS e Windows. Cada runner compila e executa a cobertura e o Playwright. O runner Linux envia o LCOV ao Codecov. Para habilitar, vincule o repositório no Codecov e configure o segredo de Actions `CODECOV_TOKEN` com o token de upload.

Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions**. Um push na main publica o site após aprovação dos três builds. Para o Moodle, use os endereços efetivamente publicados do site, repositório, execução verde, Codecov e vídeo de até cinco minutos no YouTube.
