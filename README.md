# Bússola do Cliente

Sisteminha para mapear o estilo de comunicação dos clientes que você atende como assessor.
O cliente abre um link, responde 12 perguntas e o resultado **cai automaticamente** no seu painel.

```
index.html      questionário do cliente (link público)
painel.html     seu painel, protegido por senha
supabase.sql    estrutura do banco (rodar uma vez)
assets/         estilo, perguntas/perfis e configuração
```

---

## 1. Criar o banco no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita.
2. **New project** → escolha um nome, uma senha de banco (guarde) e a região **South America (São Paulo)**.
3. Aguarde uns 2 minutos até o projeto ficar pronto.
4. Abra **SQL Editor** no menu lateral → **New query**.
5. Abra o arquivo `supabase.sql`, **troque `TROQUE-ESTA-SENHA`** pela senha que você vai usar no painel.
6. Cole o conteúdo inteiro no SQL Editor e clique em **RUN**. Deve aparecer "Success".

## 2. Conectar o site ao banco

1. No Supabase, vá em **Project Settings → Data API**.
2. Copie o **Project URL** e a chave **anon public**.
3. Abra `assets/config.js` e cole os dois valores nas linhas indicadas.

A chave anon pode ficar visível no navegador: as tabelas estão bloqueadas por RLS
e todo acesso passa pelas funções do `supabase.sql`, que validam o que entra e sai.
Quem tiver a chave consegue apenas **enviar uma resposta** — não consegue listar nada sem a senha.

## 3. Publicar na internet

1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop).
2. Arraste a **pasta inteira** deste projeto para a área indicada.
3. O Netlify devolve uma URL, algo como `https://nome-aleatorio.netlify.app`.
4. Crie uma conta gratuita para o site não expirar, e em **Site configuration → Change site name**
   troque para algo apresentável, tipo `perfil-clientes-gui.netlify.app`.

Seus endereços passam a ser:

- Questionário do cliente: `https://seu-site.netlify.app/`
- Seu painel: `https://seu-site.netlify.app/painel.html`

## 4. Como usar no dia a dia

1. Abra `/painel.html` e digite a senha.
2. Em **Cadastrar cliente**, digite o nome e clique em **Gerar link**.
3. Copie o link ou clique em **Enviar por WhatsApp**. O link já vem com o nome do cliente,
   então ele não precisa digitar nada.
4. Quando o cliente responder, o registro muda de **Aguardando** para a cor do perfil dele,
   automaticamente. Clique em **Atualizar** para buscar os novos.
5. Clique em **Ver perfil** para abrir o guia de como se comunicar com aquela pessoa.

Se alguém abrir o link sem o `?c=`, o questionário pede o nome e a resposta entra no painel
como registro avulso. Funciona igual.

---

## Testar antes de publicar

Abrir o arquivo com duplo clique (`file://`) não funciona, porque o navegador bloqueia as
chamadas ao banco. Rode um servidor local:

```bash
cd "/Users/guisimoes/Teste Personalidade"
python3 -m http.server 8000
```

Depois abra `http://localhost:8000` (questionário) e `http://localhost:8000/painel.html` (painel).

## Trocar a senha do painel

No SQL Editor do Supabase, rode só isto com a senha nova:

```sql
create or replace function public.senha_painel()
returns text language sql immutable security definer set search_path = public
as $$ select 'SUA-NOVA-SENHA'::text $$;
revoke all on function public.senha_painel() from public;
```

## Pontos de atenção

**O SQL não foi executado aqui** — não havia Postgres nem Docker nesta máquina para testar.
Se o **RUN** no Supabase devolver erro, me mande a mensagem exata que eu corrijo.

**Dados pessoais e LGPD.** O sistema guarda nome do cliente e respostas comportamentais num
banco fora do ambiente do banco onde você trabalha. Confirme com a sua área de compliance se
isso é permitido antes de usar com clientes reais, especialmente por serem clientes de uma
instituição financeira. Não coloque CPF, conta, valores ou qualquer dado de investimento aqui.

**Não é suitability.** Este questionário lê estilo de comunicação, não perfil de investidor.
Ele não substitui nem complementa a API/suitability e não deve ser usado para justificar
recomendação de produto.

**Envio sem limite de taxa.** A função de envio é pública: em teoria alguém com a chave anon
poderia inserir respostas falsas em volume. Para uso individual isso é irrelevante, mas se
quiser fechar, dá para exigir que o `?c=` seja sempre válido ou adicionar um captcha.

**Limites do plano gratuito.** O Supabase pausa projetos gratuitos após 7 dias sem nenhuma
requisição — basta abrir o painel de vez em quando. Netlify e Supabase gratuitos são
suficientes de sobra para o volume de uma carteira de clientes.

## Sobre o conteúdo das perguntas

As 12 perguntas e as descrições dos 5 perfis foram escritas originalmente para este projeto.
A lógica geral de cinco estilos por cor é a mesma de frameworks amplamente usados, mas o
texto do material interno do Itaú/Atma Genus (marcado como "Proibida a Reprodução" e
"Uso Interno") não foi reproduzido aqui — aquele material não deve circular fora do
treinamento interno, e menos ainda ser enviado a clientes.

Para ajustar perguntas, perfis ou dicas, edite `assets/dados.js`. A pontuação é calculada
tanto no navegador quanto no banco a partir das 12 letras (A/R/M/V/B), então mudar o **texto**
é seguro; se mudar a **cor** de alguma alternativa, o histórico antigo continua valendo pela
letra registrada.
