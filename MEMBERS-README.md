# Área de membros Arte Digital

A versão atual do repositório é um site estático HTML/CSS/JavaScript, sem backend, roteador ou banco de dados. Para não recriar nem apagar o portfólio, a área de membros foi adicionada em `members.html` e mantém `index.html` intacto.

## Configuração obrigatória

1. Crie um projeto no [Supabase](https://supabase.com) e execute `supabase-schema.sql` no SQL Editor.
2. Em `members.js`, preencha apenas `supabaseUrl` e `supabaseAnonKey` com as credenciais públicas do projeto. Nunca use `service_role` no navegador.
3. Configure os redirects de autenticação no Supabase para o domínio publicado e `members.html`.
4. Configure `whatsappNumber` (apenas números, com país), `purchaseUrl` quando existir uma página real de checkout, e opcionalmente `supportMessage`.
5. Crie os cursos, módulos e as 12 aulas reais na base de dados. O código não inventa aulas, alunos, credenciais ou pagamentos aprovados.

Abra `members.html` para a aplicação. O login, cadastro, recuperação de senha, sessão, logout, perfil e progresso usam Supabase Auth/Database. O acesso à aula é validado por RLS no banco, não apenas no frontend.

## Segurança e integrações futuras

- O painel administrativo não é acessível por alunos: a role é verificada no frontend e, para operações administrativas reais, deve ser validada novamente numa Supabase Edge Function com `service_role` guardada como secret.
- Não coloque URLs privadas de vídeo em `lessons` como URL pública. Use `video_asset_id` e uma Edge Function autenticada que valide `enrollments.status = 'active'` e devolva uma URL assinada com expiração curta.
- O pagamento não é simulado. Quando um gateway for escolhido, configure o webhook no servidor/Edge Function; somente um webhook verificado deve mudar `enrollments.status` para `active`.
- Para o relatório administrativo, implemente uma Edge Function `admin-students` que valide `profiles.role = 'admin'` antes de consultar alunos. A política RLS deliberadamente não permite que alunos leiam os perfis de terceiros.

Sem Supabase configurado, a página exibe uma mensagem de configuração e não cria uma autenticação falsa.
