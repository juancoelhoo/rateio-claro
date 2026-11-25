# Rateio Claro

## Integrantes

1. Bruna Caroline Cardoso da Silva 
2. Juan Vinicius Coelho
3. Nathally Fernandes de Brito Oliveira

## Sobre o sistema

Crie um encontro, adicione participantes e registre quanto cada pessoa pagou. Para cada despesa, marque quem consumiu e escolha divisão igual ou por quantidade. O resumo mostra pagamento, consumo, saldo e transferências sugeridas. O Django salva encontros, participantes e despesas no SQLite. Começar outro encontro preserva o anterior no histórico. Um cookie identifica os encontros deste navegador. Limpar os cookies remove o acesso a esse histórico. Se houver um encontro da versão anterior, a tela inicial oferece sua importação.

Os cálculos usam centavos inteiros. No rateio proporcional, os centavos restantes vão para as maiores frações, com desempate pela ordem de cadastro. Por exemplo, R$ 10,00 para três consumidores em partes iguais resulta em R$ 3,34, R$ 3,33 e R$ 3,33.

## Tecnologias

React e TypeScript compõem a interface e as regras de negócio. Django expõe a API e usa SQLite para persistência. Vite compila a interface. Vitest e V8 verificam comportamentos e cobertura. Playwright executa jornadas no Chromium.

## Uso de IA

O Codex auxiliou na escolha do tema, na implementação da interface, do backend, da persistência e dos cálculos, na configuração do workflow e na escrita dos testes iniciais. Cada integrante deve complementar esta seção com sua própria utilização durante o trabalho.

## Rodar localmente

Na pasta do projeto, use Python 3.12 e Node 22.12 ou superior da série 22. No primeiro terminal:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

No Windows, ative com `.venv\Scripts\activate`. No segundo terminal execute `npm ci` e `npm run dev`. Abra o endereço exibido pelo Vite. Os dados ficam em `db.sqlite3` na raiz do projeto.

## Execução dos testes

Use Node.js 22.12 ou superior da série 22. Com o ambiente Python acima ativado, execute:

```sh
npm ci
python -m coverage run manage.py test
python -m coverage report
npm test
npm run coverage
npx playwright install --with-deps chromium
npm run e2e
npm run build
```

Para usar o sistema, execute `npm run dev` e abra o endereço exibido. O build de produção fica em `dist/`. A cobertura considera a interface e o domínio, excluindo apenas o ponto de montagem React. O workflow exige 80% de linhas, funções, instruções e ramificações.

## Cobertura dos requisitos de testes

A suíte contém **53 testes unitários de domínio**, 2 testes de integração da interface, 4 testes da API Django e **5 testes E2E**. Os testes de domínio cobrem entradas monetárias, validação e distribuição de parcelas, cálculo de saldos e sugestões de transferências. Os E2E percorrem a divisão igual, seleção de consumidores, divisão por quantidade, despesas pagas por pessoas diferentes e histórico.

O workflow executa build, testes, cobertura e E2E em Linux, macOS e Windows. Ele envia os relatórios LCOV e XML ao Codecov quando o segredo `CODECOV_TOKEN` está configurado. A cobertura JavaScript exige 80% em linhas, funções, instruções e ramificações; a cobertura Django exige 80% no relatório geral.

## Pendências da entrega

- O enunciado exige pelo menos 50 commits, com mensagens descritivas e mudanças pequenas. Os testes adicionados foram registrados individualmente no histórico.
- Vincular o repositório ao Codecov e configurar `CODECOV_TOKEN` nos segredos do GitHub Actions para confirmar a publicação dos relatórios.
- Publicar a aplicação com armazenamento persistente e configurar `DEPLOY_HOOK` e `DEPLOY_ENABLED=true` para habilitar o deploy pelo workflow.
- Gravar e publicar no YouTube o vídeo de até 5 minutos solicitado pelo trabalho.
- Completar a seção “Uso de IA” com a contribuição de cada integrante.

## CI e publicação

O workflow de build roda em push e pull request, nos runners Ubuntu, macOS e Windows. Cada runner compila e executa a cobertura e o Playwright. O runner Linux envia o LCOV e o XML do Python ao Codecov. Para habilitar, vincule o repositório no Codecov e configure o segredo de Actions `CODECOV_TOKEN` com o token de upload.

Para produção, o Dockerfile serve React e Django na mesma origem. Use um serviço com volume permanente em `/data`, defina `DJANGO_SECRET_KEY` com um segredo estável e `DJANGO_ALLOWED_HOSTS` com o domínio público. Para disparar a publicação após os testes, configure o segredo `DEPLOY_HOOK` com a URL de deploy do serviço e a variável de Actions `DEPLOY_ENABLED=true`. O GitHub Pages sozinho não executa a API.
