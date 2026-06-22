# Avaliador Tech Recruiter

_Última atualização: Junho de 2026_ • [Acessar a Aplicação (AWS + Cloudflare)](https://techrecruiter.syntelix.ia.br)

<p align="center">
  <img src="https://img.shields.io/badge/Status-MVP_Production-success" alt="Status">
  <img src="https://img.shields.io/badge/Stack-Go_%7C_React_%7C_AWS-blue" alt="Stack">
  <img src="https://img.shields.io/badge/AI-Google_Gemini_Vertex-orange" alt="AI">
</p>

> O **Avaliador Tech Recruiter** é um scanner de maturidade técnica *AI-native* desenhado para recrutadores. Ele cruza requisitos de vagas com evidências extraídas de currículos (PDF), GitHub, LinkedIn e portfólios.

A filosofia principal deste produto é ser **evidence-first** e **human-reviewed**. Ele **não emite notas, rankings ou vereditos de aprovação/rejeição**. Em vez disso, organiza os achados técnicos em uma matriz de evidências clara e formula perguntas direcionadas (STAR) para a entrevista técnica.

---

## 🚀 Roadmap e Evolução (Risk-ordered Tiers)

O projeto foi e continua sendo executado em *slices* verticais baseados em risco:

- ✅ **Tier 0 (Walking Skeleton)**: Go + `chi` router, contratos de dados `JSON-first` (compartilhados com o TypeScript), esqueleto Vite+React.
- ✅ **Tier 1 (Mock-mode Demo)**: Pipeline determinístico mockado com Eventos SSE, testando o fluxo de ponta a ponta na UI sem gastar tokens reais.
- ✅ **Tier 2 (Primeiro Raciocínio Real)**: Pipeline LLM text-only conectado via `LLMClient` aos modelos Gemini. Agentes de perfilamento, cruzamento de evidências e formatação da matriz.
- ✅ **Tier 3 (Ingestão de Evidências)**:
  - `GitHub-lite`: Análise estática rápida de repositórios públicos.
  - `Extração de PDF nativa em Go`: Parsing local de currículos e textos.
  - `Portfolio mini-crawler`: Extração limitada de conteúdo HTML.
- ✅ **Tier 4 (Cloud & Deploy)**: Dockerização da API, build do Frontend e infraestrutura provisionada via AWS App Runner, AWS Amplify e Proxy/DNS na Cloudflare.
- 🚧 **Stretch / Future**: Amostragem profunda de código no GitHub (AST/Tree-sitter), persistência dos relatórios em banco de dados, login multi-usuários, e extensões via MCP/Claude Code.

---

## 🏗️ Arquitetura e Engenharia

### 1. A Pipeline de Agentes Assíncrona
Um fluxo estritamente controlado de 9 agentes que atua como uma linha de montagem, garantindo consistência e mitigando alucinações de modelos não controlados:
1. `JobProfileAgent`: Interpreta a vaga e define a senioridade e stack esperados.
2. `ResumeEvidenceAgent` / `LinkedInEvidenceAgent` / `PortfolioEvidenceAgent`: Especialistas em extração de *claims* (alegações) das fontes brutas.
3. `GitHubEvidenceAgent`: Avaliador de metadados, stacks e qualidade estática em repositórios públicos.
4. `EvidenceCheckerAgent` & `QuadrantClassifierAgent`: Cruzam as alegações contra evidências e as categorizam na Matriz de Evidências (Forte/Fraco x Validado/Pendente).
5. `STARQuestionAgent`: Formula perguntas comportamentais/técnicas para cobrir os "buracos" da validação.
6. `TechnicalMaturityAnalystAgent`: Faz a síntese executiva e formata o JSON final e o export Markdown.

### 2. O Backend (Go API)
- **Engine**: Go + `chi` router, rodando operações *stateless* e *in-memory* para o MVP.
- **Integração e UX**: Progresso dos agentes é injetado no Frontend via **Server-Sent Events (SSE)** (`GET /api/analyses/{id}/events`).
- **Segurança**: Processamento de PDFs e crawling de repositórios ocorre na memória da máquina/container, sem upload de arquivos dos candidatos para nuvens ou LLMs públicos desnecessariamente.

### 3. O Frontend (React + Vite)
- **SPA Moderna**: Sem rotas complexas (no React Router para o MVP), estado gerido puramente via `useReducer`.
- **Design System**: O UI/UX é construído do zero via *Design Tokens* CSS (`design/`), garantindo consistência visual profissional e focada na leitura do recrutador.

### 4. Infraestrutura: Docker, AWS e Cloudflare
O deploy segue o **ADR-0007**, desenhado para alta disponibilidade, auto-scale nativo e proteção de borda.
- **Imagens Mutáveis**: A API é empacotada em uma imagem Docker `linux/amd64` enxuta.
- **AWS App Runner**: Roda a imagem de API expondo tráfego HTTPS na porta `8080`, puxando o segredo `GOOGLE_API_KEY` isolado do AWS Secrets Manager.
- **AWS Amplify**: O Frontend é versionado de forma estática via rede CDN, buildado injetando a `VITE_API_BASE_URL` da AWS no momento da transpilação.
- **Edge Proxy (Cloudflare)**: Domínio customizado (`techrecruiter.syntelix.ia.br`) sob Cloudflare (Proxy *Full Strict* mode) roteando tráfego simultaneamente para o Amplify (app) e App Runner (api).

---

## 💻 Desenvolvimento Local

O repositório adota um fluxo de paralelismo isolado e *gatekeeping* estrito via Testes Automatizados L0/L1/L2.

**Requisitos**: Go 1.22+, Node.js 20+, Docker.

1. **Clone e Instalação**
   ```bash
   git clone https://github.com/CafeSemCafeina/avaliador-tech-recruiter.git
   cd avaliador-tech-recruiter
   ```
2. **Rodando a API (Modo Mock)**
   No modo `mock` (Padrão), a API responde perfeitamente, de forma determinística e imediata, simulando a resposta da IA. Útil para debugar a Interface Visual.
   ```bash
   cd backend
   go run ./cmd/server
   ```
3. **Rodando a API (Modo Gemini Real)**
   Crie um `.env` em `backend/` com `ANALYSIS_MODE=gemini` e sua chave de API (`GOOGLE_API_KEY`), ou use Workload Identity/Vertex ADC do Google Cloud.
4. **Subindo o Frontend**
   Em outro terminal:
   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

*(Para empacotar em um contêiner rapidamente, há o arquivo `docker-compose.yml` que sobe ambas as frentes).*

---

## 🎯 Nossos Princípios Técnicos Inegociáveis

1. **Nunca dê a nota final**: Proibido emitir ranking numérico ou ditar "Aprovado/Reprovado". Apenas os dados suportam decisões humanas.
2. **Falta de evidência não é prova de incapacidade**: Se não houver projeto no GitHub validando "React", isso não é ponto negativo; é gerada uma *STAR Question* de validação técnica para a entrevista.
3. **Evidence-first**: Todo *claim* do candidato deve ter rastreabilidade da sua fonte (CV, LinkedIn, GitHub).
4. **Mock Floor Protected**: O pipeline determinístico de testes deve rodar 100% verde localmente e offline. Nenhuma PR é mergeada sem passar no `gate.ps1`.

---

## 📂 Mapa do Repositório

- 📂 `backend/`: Código Go, rotas da API, testes e orquestração de Agentes.
- 📂 `frontend/`: Single Page Application em React.
- 📂 `design/`: Design System e Tokens CSS primários.
- 📂 `docs/` e `specs/`: PRDs, Execution Plans e ADRs (Decisões Arquiteturais). A única fonte da verdade do que deve ou não ser codificado.
- 📂 `orchestration/`: Scripts e automações de `git worktree` para paralelização entre agentes IA/Múltiplos desenvolvedores.
