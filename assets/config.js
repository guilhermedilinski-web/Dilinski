// Conexão com o projeto Supabase "Dilinski".
// A chave anon é feita para ficar no navegador: sozinha ela não lê nem escreve
// nada, porque as tabelas estão bloqueadas por RLS e todo acesso passa pelas
// funções do supabase.sql. Listar o painel exige a senha, que fica só no banco.

window.SUPABASE_URL = "https://erlexjitmvcvsfxqicxw.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybGV4aml0bXZjdnNmeHFpY3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NjQyODQsImV4cCI6MjEwNTI0MDI4NH0.d_8xyb1YwpciZTKziKxewtQCHq9BymrvYj8u6XfXRhY";
