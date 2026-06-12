# N8N Custom Nodes Workspace

Este repositório agrupa vários pacotes de nodes customizados para n8n, cada um responsável por uma integração específica com APIs ou serviços externos.

## Visão geral

A estrutura do workspace contém múltiplos pacotes independentes, cada um com seu próprio `package.json` e `tsconfig.json`.

### Pacotes incluídos

- `n8n-nodes-accesstage`: node customizado para a API Accesstage APUS.
- `n8n-nodes-be-compliance`: node customizado para a API BeCompliance.
- `n8n-nodes-master-nodes-ERPSAPB1`: node customizado para integração com ERPSAP B1 e operações relacionadas.
- `n8n-nodes-master-pagcorp`: node customizado para a API PagCorp.
- `n8n-nodes-omie`: node customizado para a API Omie.
- `n8n-nodes-sap-hana-data`: node customizado para extração de dados do SAP HANA.
- `n8n-nodes-uber`: node customizado para Uber (SFTP e relatórios de viagem).

## Estrutura do repositório

- `docker-compose.custom.yml`: configuração Docker para rodar n8n com nodes customizados.
- `Dockerfile.n8n-custom`: Dockerfile customizado para construir o ambiente n8n.
- `up-custom-nodes.sh` / `down-custom-nodes.sh`: scripts de inicialização e parada do ambiente.
- `n8n-nodes-*/`: pacotes individuais de nodes.

## Como configurar

1. Navegue até o pacote do node que deseja usar. Exemplo:
   ```bash
   cd n8n-nodes-omie
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Compile o pacote:
   ```bash
   npm run build
   ```
4. No n8n, registre os nodes customizados apontando para a pasta `dist` do pacote.

## Uso com Docker

O repositório inclui scripts e configuração para executar um n8n customizado.

1. Construa o ambiente Docker se necessário.
2. Inicie o ambiente:
   ```bash
   ./up-custom-nodes.sh
   ```
3. Pare o ambiente:
   ```bash
   ./down-custom-nodes.sh
   ```

> Observação: os scripts Docker podem exigir permissões de execução. Caso necessário, torne-os executáveis com `chmod +x up-custom-nodes.sh down-custom-nodes.sh`.

## Recomendações

- Mantenha cada pacote atualizado com sua própria documentação interna.
- Considere padronizar `package.json`, dependências e scripts entre os pacotes.
- Se o workspace crescer, pense em migrar para um monorepo gerenciado com `npm workspaces` ou `pnpm`.

## Contato

Este workspace foi organizado para facilitar desenvolvimento e testes de nodes n8n customizados.
