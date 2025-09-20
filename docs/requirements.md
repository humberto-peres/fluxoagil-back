# Requisitos do Sistema de Gestão de Tarefas

## ✅ Requisitos Funcionais (RF)

- **RF01**: O usuário deve poder criar uma conta com suas informações pessoais.
- **RF02**: O usuário deve poder realizar login no sistema.
- **RF03**: O usuário deve poder editar suas informações pessoais.
- **RF04**: O usuário deve poder criar, editar e excluir tarefas.
- **RF05**: O usuário deve poder personalizar os status das tarefas.
- **RF06**: O usuário deve poder definir responsáveis e prazos para as tarefas.
- **RF07**: O usuário deve poder criar quadros de tarefas.
- **RF08**: O usuário deve poder criar e gerenciar sprints (se Scrum).
- **RF09**: O usuário deve poder configurar propriedades iniciais do quadro (Prioridade, Etapa, Equipe, Workspace).
- **RF10**: O usuário deve poder acessar os workspaces em que está incluído como membro.
- **RF11**: O sistema deve criar novas tarefas na coluna inicial definida pelo usuário.
- **RF12**: O usuário deve poder aplicar filtros para busca de tarefas, quadros ou workspaces.
- **RF13**: O sistema deve permitir visualização detalhada de uma tarefa.
- **RF14**: O usuário administrador deve poder criar equipes (times) associando membros.
- **RF15**: O sistema deve realizar movimentação automática de tarefas ao serem concluídas, ao atingir data limite ou ao detectar commits/merges Git.
- **RF16**: O sistema deve disponibilizar dashboards de progresso por status, equipe e membro.
- **RF17**: O sistema deve exibir notificações em tela para alterações de status das tarefas.

---

## ⚙️ Requisitos Não-Funcionais (RNF)

- **RNF01**: O sistema deve ser responsivo.
- **RNF02**: O sistema não deve permitir cadastro com usernames duplicados.
- **RNF03**: O sistema deve implementar autenticação segura com armazenamento protegido.
- **RNF04**: O sistema deve impedir workspaces duplicados.
- **RNF05**: O sistema deve suportar Kanban e Scrum.
- **RNF06**: O sistema deve integrar API de CEP para preenchimento automático de endereço.
- **RNF07**: O sistema requer acesso à internet para funcionamento (não oferece suporte offline).
