# PRD - Avaliador Tech Recruiter

Produto: Avaliador Tech Recruiter  
Repositorio: https://github.com/CafeSemCafeina/avaliador-tech-recruiter  
Data de inicio planejada: ____ / ____ / ______  
Prazo-alvo: 1 semana  
Data real de finalizacao: ____ / ____ / ______  
Status: Planejado

## 1. Contexto

Este projeto e uma demonstracao pratica de desenvolvimento full-stack AI-native aplicada a recrutamento tecnico.

A proposta e construir um MVP pequeno, hospedado, testavel e bem documentado que mostre como transformamos um problema ambiguo de hiring em um produto funcional: analisar maturidade tecnica de candidatos a partir de vaga, curriculo, GitHub, LinkedIn exportado e portfolio, organizando evidencias e perguntas de entrevista.

O projeto tambem serve como prova de processo: pesquisa, definicao de escopo, arquitetura, implementacao, testes, CI, deploy cloud, documentacao e uso criterioso de agentes de IA.

## 2. Meta do desafio

Meta principal: construir, em ate 1 semana, um produto demonstravel que evidencie capacidade real de entregar software com Go, TypeScript, React, IA, containers e cloud.

O projeto deve demonstrar:

- capacidade de transformar contexto de negocio em produto;
- Go backend real;
- React + TypeScript + Vite;
- agentic workflow com framework Go-native;
- analise estatica de GitHub;
- parsing de documentos com solucao open source;
- deploy em AWS Amplify e ECS Express Mode;
- containerizacao;
- testes minimos;
- CI com GitHub Actions;
- documentacao de workflow AI-native;
- conforto com Linux, tmux e SSH;
- criterio de produto alinhado a recrutamento humano, sem score frio.

Se o MVP for planejado para 1 semana e finalizado em 2-3 dias, registrar a data real de finalizacao acima como evidencia de velocidade de execucao.

## 3. Problema

Recrutadores tecnicos precisam avaliar candidatos rapidamente, mas as evidencias ficam fragmentadas:

- curriculo contem claims;
- LinkedIn contem autorrelato publico;
- GitHub contem evidencias de codigo, mas exige leitura tecnica;
- portfolio pode conter projetos e cases, mas tambem marketing;
- senioridade esperada muda conforme a vaga;
- ausencia de evidencia publica nao significa ausencia de habilidade.

Ferramentas de triagem baseadas apenas em score podem ser rapidas, mas reduzem nuance e podem criar vereditos falsos. A proposta aqui e diferente: organizar evidencias e incertezas para orientar uma entrevista humana melhor.

## 4. Usuarios-alvo

### Usuario primario

Recruiter ou talent partner que precisa conduzir screening tecnico inicial de candidatos.

Necessidades:

- entender rapidamente se o candidato parece junior, pleno ou senior para uma vaga;
- saber quais claims estao evidenciados;
- saber quais pontos precisam ser validados;
- receber perguntas tecnicas estruturadas;
- ter um resumo claro para hiring manager.

### Usuario secundario

Hiring manager tecnico que recebe candidatos filtrados.

Necessidades:

- entender os trade-offs do candidato;
- ver evidencias concretas;
- identificar riscos tecnicos;
- preparar entrevista sem ler todos os repositorios.

## 5. Proposta de solucao

O Avaliador Tech Recruiter recebe uma vaga e um conjunto de evidencias do candidato. Em seguida, roda um pipeline agentico controlado que:

1. interpreta o perfil tecnico ideal da vaga;
2. extrai claims do curriculo;
3. extrai sinais do LinkedIn exportado;
4. analisa repositorios publicos do GitHub de forma estatica;
5. extrai sinais do portfolio;
6. cruza claims e evidencias;
7. classifica findings em uma matriz de 4 quadrantes;
8. gera perguntas STAR;
9. cria um relatorio final para recruiter e hiring manager.

O produto nao toma decisao de contratacao, nao ranqueia candidatos e nao gera score final.

## 6. Principios de produto

- Evidencia antes de opiniao.
- Sem score final.
- Sem veredito automatico.
- Ausencia de evidencia publica vira pergunta, nao acusacao.
- Cada conclusao importante deve citar fonte.
- Linguagem conservadora e profissional.
- Recruiter continua no controle.
- O sistema deve acelerar investigacao, nao substituir julgamento.

## 7. Escopo do MVP de 1 semana

### Incluido

- Wizard de vaga.
- Wizard de candidato.
- Upload ou paste de curriculo.
- Upload ou paste de LinkedIn exportado/PDF.
- Campo GitHub URL.
- Campo portfolio URL opcional.
- Analise estatica de repositorios GitHub publicos nao vazios.
- Parsing de PDF via ferramenta open source.
- Pipeline de agents com etapas visiveis.
- Relatorio final sem score.
- Matriz de 4 quadrantes.
- Badges qualitativos.
- Perguntas STAR.
- Export Markdown.
- README tecnico.
- PRD no repositorio.
- Testes minimos.
- CI basico.
- Deploy frontend em AWS Amplify.
- Deploy backend container em AWS ECS Express Mode, ou fallback documentado se houver bloqueio.

### Excluido do MVP

- Login/autenticacao.
- Multiusuario.
- Banco de dados robusto.
- Scraping com cookie do LinkedIn.
- Execucao de codigo dos repositorios do candidato.
- Integracao real com ATS externo.
- Score final.
- Ranking entre candidatos.
- Decisao automatica de contratar/rejeitar.
- Terraform completo.
- Kubernetes.

## 8. Fluxo de usuario

### Etapa 1 - Vaga

Campos:

- descricao da vaga;
- senioridade minima: Intern, Junior, Mid, Senior, Staff;
- anos de experiencia opcional;
- tags de stack tecnologica;
- selecao de ate 3 stacks principais;
- notas opcionais do recruiter.

Resultado:

- perfil tecnico ideal da vaga;
- expectativas de projeto por senioridade;
- requisitos tecnicos obrigatorios e desejaveis.

### Etapa 2 - Candidato

Campos:

- curriculo PDF ou texto;
- LinkedIn PDF/texto exportado;
- GitHub URL;
- portfolio URL opcional;
- notas opcionais.

Observacao de UX:

O LinkedIn deve ser tratado por upload/paste. A UI deve explicar que o sistema nao faz login, nao usa cookies e nao acessa dados privados.

### Etapa 3 - Analise

Tela de loading/progresso com etapas:

1. Parsing resume.
2. Extracting role maturity profile.
3. Reading LinkedIn evidence.
4. Analyzing GitHub repositories.
5. Reading portfolio signals.
6. Checking claims against evidence.
7. Building evidence matrix.
8. Generating STAR questions.
9. Running analyst self-review.
10. Finalizing report.

### Etapa 4 - Resultado

Blocos:

- resumo executivo;
- badges qualitativos;
- matriz de evidencias;
- claims confirmados;
- claims que precisam validacao;
- lacunas tecnicas;
- perguntas STAR;
- resumo para recruiter;
- resumo para hiring manager;
- export Markdown.

## 9. Modelo da matriz

### Forte com evidencias

O candidato declara ou demonstra uma competencia e ha evidencias consistentes em curriculo, GitHub, LinkedIn ou portfolio.

### Forte, mas precisa avaliar

O candidato aparenta ter uma competencia relevante, mas a evidencia e indireta, superficial ou insuficiente.

### Fraco com evidencias

Ha sinais concretos de lacuna em relacao a vaga.

### Fraco, mas precisa avaliar

Ha sinal de possivel fraqueza, mas nao ha evidencia suficiente para concluir.

## 10. Badges qualitativos

Exemplos:

- Seniority Signal: Pleno plausivel, precisa validar backend ownership.
- Stack Evidence: Forte em React/TypeScript, fraco em Go publico.
- Project Depth: Moderada.
- Backend Evidence: Precisa avaliacao.
- Public Proof: Misto.
- Interview Priority: Alta em backend/deploy.

Badges nao devem virar score numerico.

## 11. Agent pipeline

### 11.1 JobProfileAgent

Responsabilidade:

- interpretar vaga;
- mapear senioridade esperada;
- definir perfil tecnico ideal;
- indicar que tipo de evidencia seria esperada.

Output:

- requisitos obrigatorios;
- requisitos desejaveis;
- expectativa por senioridade;
- riscos tecnicos a validar.

### 11.2 ResumeEvidenceAgent

Responsabilidade:

- extrair claims tecnicos do curriculo;
- separar skills, experiencias, projetos, educacao, ferramentas e impacto;
- marcar claims como explicitos, vagos ou contextuais.

### 11.3 LinkedInEvidenceAgent

Responsabilidade:

- extrair experiencias, certificacoes, educacao, skills e atividades do LinkedIn exportado;
- comparar sinais com o curriculo;
- tratar LinkedIn como autorrelato publico, nao como verdade absoluta.

### 11.4 GitHubEvidenceAgent

Responsabilidade:

- analisar repositorios publicos nao vazios;
- detectar linguagens, frameworks, READMEs, estrutura, testes, Dockerfile, CI e sinais de deploy;
- diferenciar projeto original, fork, tutorial ou repositorio pouco conclusivo;
- nao executar codigo.

### 11.5 PortfolioEvidenceAgent

Responsabilidade:

- extrair texto e links de portfolio;
- identificar projetos, stacks declaradas, deploys e cases;
- cruzar sinais com GitHub e curriculo.

### 11.6 EvidenceCheckerAgent

Responsabilidade:

- cruzar requisitos da vaga com evidencias do candidato;
- classificar claims como confirmados, plausiveis, nao verificados, fracos ou conflitantes;
- evitar acusacoes de exagero sem base.

### 11.7 QuadrantClassifierAgent

Responsabilidade:

- transformar findings na matriz de 4 quadrantes;
- manter fonte, racional e pergunta de validacao para cada item.

### 11.8 STARQuestionAgent

Responsabilidade:

- gerar perguntas STAR tecnicas;
- incluir follow-ups;
- indicar o que uma boa resposta deveria revelar;
- evitar linguagem acusatoria.

### 11.9 TechnicalMaturityAnalystAgent

Responsabilidade:

- realizar julgamento final de maturidade tecnica sem score;
- revisar consistencia;
- apontar caveats;
- escrever relatorio final.

Auto-check obrigatorio:

- estou confundindo ausencia de evidencia com ausencia de habilidade?
- cada conclusao tem fonte?
- estou usando score disfarçado?
- cada fraqueza virou pergunta investigavel?
- a senioridade foi considerada corretamente?

## 12. Arquitetura tecnica

```text
AWS Amplify
  React + TypeScript + Vite frontend
        |
        v
AWS ECS Express Mode
  Go API container
  Eino/agent workflow
  Doc parsing worker
  GitHub static analyzer
        |
        v
AI provider
  Evidence reasoning
  STAR questions
  Report generation
```

### Frontend

- React;
- TypeScript;
- Vite;
- wizard de entrada;
- tela de progresso;
- tela de resultado;
- export Markdown.

### Backend

- Go HTTP API;
- endpoints para iniciar analise, consultar status e buscar relatorio;
- pipeline agentico controlado;
- parsing de documentos;
- GitHub static analysis;
- logs estruturados.

### Cloud

- Amplify para frontend;
- ECR para imagem Docker;
- ECS Express Mode para backend container;
- CloudWatch para logs;
- S3 opcional para uploads/exports.

## 13. Endpoints iniciais

```text
GET  /health
POST /api/analyses
GET  /api/analyses/{id}/status
GET  /api/analyses/{id}/report
GET  /api/analyses/{id}/export.md
```

O fluxo deve ser assincrono ou simular assincronia com status por etapa, para evitar requests longos e para mostrar o pipeline agentico.

## 14. Dados e contratos

### JobInput

```json
{
  "description": "",
  "seniority": "junior|mid|senior|staff",
  "yearsExperience": null,
  "stackTags": [],
  "primaryStacks": [],
  "notes": ""
}
```

### CandidateInput

```json
{
  "resumeText": "",
  "linkedinText": "",
  "githubUrl": "",
  "portfolioUrl": "",
  "notes": ""
}
```

### QuadrantItem

```json
{
  "title": "",
  "quadrant": "strong_with_evidence|strong_needs_validation|weak_with_evidence|weak_needs_validation",
  "sources": [],
  "rationale": "",
  "interviewFocus": ""
}
```

## 15. Analise estatica de GitHub

O MVP deve analisar publicamente:

- repositorios nao vazios;
- linguagens;
- README;
- `package.json`;
- `go.mod`;
- `requirements.txt`;
- `pyproject.toml`;
- `Dockerfile`;
- estrutura de pastas;
- indicios de testes;
- indicios de CI;
- indicios de deploy.

O MVP nao deve:

- executar codigo;
- rodar scripts de install;
- rodar testes de repositorios externos;
- clonar e executar projetos sem sandbox.

## 16. PDF e documentos

Documento parsing deve usar uma solucao open source pronta. Preferencia:

- Docling como primeira opcao;
- fallback para texto colado/manual;
- OCR desligado por padrao;
- limite de tamanho;
- timeout;
- logs de falha.

## 17. Testes

### Backend

- unit tests para normalizacao de stacks;
- testes para classificacao de quadrantes;
- testes para STAR question generation com mocks;
- testes de handlers HTTP;
- fixtures para GitHub analysis;
- LLM calls mockadas.

### Frontend

- testes de tags;
- teste de selecao de ate 3 stacks principais;
- teste de renderizacao da matriz;
- teste do client API com fetch mockado.

### E2E

Um fluxo Playwright:

1. preencher vaga;
2. preencher candidato fake;
3. iniciar analise;
4. ver progresso;
5. ver relatorio mockado;
6. exportar Markdown.

## 18. CI minimo

GitHub Actions:

- Go fmt/vet/test/build;
- frontend lint/typecheck/test/build;
- Docker build;
- secret scanning;
- govulncheck, se nao atrasar;
- deploy backend separado e manual/main-only.

## 19. Skills e rubricas

### Skills para coding agent

Criar skills no repositorio para guiar trabalho AI-native:

- `tech-maturity-project`;
- `evidence-matrix-analyst`;
- `aws-ecs-express-deploy`.

### Rubricas internas dos agentes

Criar arquivos de conhecimento:

- `evidence_policy.md`;
- `seniority.md`;
- `star_method.md`;
- `stack_taxonomy.json`.

## 20. Workflow Linux, tmux e SSH

Desenvolvimento preferencial em WSL/Ubuntu.

Uso planejado de tmux:

- janela backend;
- janela frontend;
- janela tests;
- janela infra;
- janela logs;
- janela git.

SSH:

- acesso ao GitHub por chave SSH;
- opcional: smoke test em EC2 temporaria, se houver tempo.

## 21. Deploy

### Frontend

- AWS Amplify;
- variavel `VITE_API_BASE_URL`;
- deploy por GitHub.

### Backend

- Dockerfile;
- push para ECR;
- ECS Express Mode;
- logs no CloudWatch;
- health check `/health`;
- env vars para AI provider e GitHub token opcional.

### Fallback

Se ECS Express Mode travar por disponibilidade, usar Render para backend e documentar o motivo. Amplify permanece como frontend AWS.

## 22. Riscos

- Docling pesado demais para container pequeno.
- ECS Express Mode gerar custo maior que esperado.
- LLM gerar conclusoes fortes demais.
- GitHub API rate limit.
- PDF de curriculo mal extraido.
- Escopo crescer por features de chat, banco, login ou scraping.

## 23. Mitigacoes

- fallback para texto colado;
- limite de PDF;
- sem OCR no MVP;
- sem execucao de codigo de terceiros;
- prompt conservador;
- outputs estruturados;
- testes com mocks;
- budgets AWS;
- apagar recursos cloud se nao forem usados.

## 24. Metricas de sucesso

O MVP sera considerado bem-sucedido se:

- estiver publicado no GitHub;
- tiver README claro;
- rodar localmente;
- tiver fluxo demonstravel de ponta a ponta;
- gerar matriz de evidencias sem score;
- gerar perguntas STAR;
- tiver testes minimos;
- tiver CI verde;
- tiver pelo menos frontend hospedado na AWS;
- tiver backend containerizado;
- tiver deploy backend em ECS Express Mode ou fallback justificado;
- tiver documentacao de decisoes e trade-offs.

## 25. Narrativa para avaliadores

Este projeto deve ser apresentado como prova de forma de trabalho:

> I built a small AI-native recruiting prototype around evidence-first technical maturity analysis. The system avoids cold match scores and instead produces a human-reviewable evidence matrix with STAR interview questions. I used Go, React, TypeScript, Vite, containers, AWS Amplify/ECS, static GitHub analysis, document parsing, tests, CI, and an agentic workflow with conservative reasoning.

## 26. Roadmap sugerido

### Dia 1

- scaffold frontend/backend;
- contratos de dados;
- tela vaga/candidato;
- README atualizado;
- health endpoint.

### Dia 2

- agent pipeline mockado;
- matriz e relatorio;
- export Markdown;
- testes iniciais.

### Dia 3

- GitHub static analysis;
- Docling/fallback texto;
- prompts/rubricas.

### Dia 4

- frontend polido;
- fluxo de progresso;
- STAR questions;
- self-review do analyst agent.

### Dia 5

- Docker;
- CI;
- deploy Amplify;
- preparar ECR/ECS.

### Dia 6

- deploy backend;
- CloudWatch/logs;
- ajustes de timeout e upload.

### Dia 7

- hardening;
- demo dataset;
- AI_WORKFLOW.md;
- video ou roteiro de apresentacao;
- revisao final.

