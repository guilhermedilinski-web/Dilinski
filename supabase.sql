-- Bússola do Cliente — estrutura do banco
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em RUN.
-- ANTES DE RODAR: troque a senha na função senha_painel() (linha marcada abaixo).

-- ---------------------------------------------------------------
-- 1. Tabelas
-- ---------------------------------------------------------------

create table if not exists public.clientes (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null check (char_length(nome) between 2 and 80),
  criado_em  timestamptz not null default now()
);

create table if not exists public.respostas (
  id           uuid primary key default gen_random_uuid(),
  cliente_id   uuid references public.clientes(id) on delete cascade,
  nome         text not null check (char_length(nome) between 2 and 80),
  respostas    text not null check (respostas ~ '^[ARMVB]{12}$'),
  scores       jsonb not null,
  perfil       text not null check (perfil in ('azul','rosa','amarelo','verde','branco')),
  criado_em    timestamptz not null default now()
);

create index if not exists respostas_cliente_idx on public.respostas (cliente_id);

-- RLS ligado e SEM policies: nenhum acesso direto às tabelas pelo navegador.
-- Todo acesso passa pelas funções abaixo, que validam o que entra e sai.
alter table public.clientes  enable row level security;
alter table public.respostas enable row level security;

-- ---------------------------------------------------------------
-- 2. Senha do painel
-- ---------------------------------------------------------------
-- Esta função fica só no servidor. O navegador nunca a executa nem a lê.

create or replace function public.senha_painel()
returns text
language sql
immutable
security definer
set search_path = public
as $$
  select 'TROQUE-ESTA-SENHA'::text   -- <<<<<< TROQUE AQUI
$$;

revoke all on function public.senha_painel() from public;

-- ---------------------------------------------------------------
-- 3. Funções usadas pela página do cliente (públicas)
-- ---------------------------------------------------------------

-- Devolve apenas o nome de um cliente, e só para quem tem o UUID do link.
create or replace function public.obter_cliente(p_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_nome text;
begin
  select nome into v_nome from public.clientes where id = p_id;
  return v_nome;
end;
$$;

-- Grava uma resposta. Único caminho de escrita disponível para o público.
create or replace function public.enviar_resposta(
  p_cliente_id uuid,
  p_nome       text,
  p_respostas  text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome    text := btrim(p_nome);
  v_letras  text := upper(btrim(p_respostas));
  v_scores  jsonb;
  v_perfil  text;
  v_id      uuid;
begin
  if v_letras !~ '^[ARMVB]{12}$' then
    raise exception 'Respostas invalidas';
  end if;
  if char_length(v_nome) < 2 or char_length(v_nome) > 80 then
    raise exception 'Nome invalido';
  end if;

  -- se o cliente_id não existir, a resposta é salva como avulsa
  if p_cliente_id is not null
     and not exists (select 1 from public.clientes where id = p_cliente_id) then
    p_cliente_id := null;
  end if;

  v_scores := jsonb_build_object(
    'azul',    (select count(*) from regexp_matches(v_letras, 'A', 'g')),
    'rosa',    (select count(*) from regexp_matches(v_letras, 'R', 'g')),
    'amarelo', (select count(*) from regexp_matches(v_letras, 'M', 'g')),
    'verde',   (select count(*) from regexp_matches(v_letras, 'V', 'g')),
    'branco',  (select count(*) from regexp_matches(v_letras, 'B', 'g'))
  );

  select k into v_perfil
  from (
    select key as k, (value::text)::int as v,
           array_position(array['azul','rosa','amarelo','verde','branco'], key) as ord
    from jsonb_each_text(v_scores) as t(key, value)
  ) s
  order by v desc, ord asc
  limit 1;

  insert into public.respostas (cliente_id, nome, respostas, scores, perfil)
  values (p_cliente_id, v_nome, v_letras, v_scores, v_perfil)
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------
-- 4. Funções do painel (exigem a senha)
-- ---------------------------------------------------------------

create or replace function public.listar_painel(p_senha text)
returns table (
  resposta_id    uuid,
  cliente_id     uuid,
  nome           text,
  cadastrado_em  timestamptz,
  respondido_em  timestamptz,
  perfil         text,
  scores         jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_senha is distinct from public.senha_painel() then
    raise exception 'Senha invalida';
  end if;

  return query
    select r.id, c.id, c.nome, c.criado_em, r.criado_em, r.perfil, r.scores
      from public.clientes c
      left join lateral (
        select x.* from public.respostas x
         where x.cliente_id = c.id
         order by x.criado_em desc
         limit 1
      ) r on true
    union all
    select r.id, null::uuid, r.nome, null::timestamptz, r.criado_em, r.perfil, r.scores
      from public.respostas r
     where r.cliente_id is null
    order by 5 desc nulls last, 4 desc nulls last;
end;
$$;

create or replace function public.criar_cliente(p_senha text, p_nome text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nome text := btrim(p_nome);
  v_id   uuid;
begin
  if p_senha is distinct from public.senha_painel() then
    raise exception 'Senha invalida';
  end if;
  if char_length(v_nome) < 2 or char_length(v_nome) > 80 then
    raise exception 'Nome invalido';
  end if;

  insert into public.clientes (nome) values (v_nome) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.excluir_cliente(p_senha text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_senha is distinct from public.senha_painel() then
    raise exception 'Senha invalida';
  end if;
  delete from public.clientes where id = p_id;
end;
$$;

create or replace function public.excluir_resposta(p_senha text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_senha is distinct from public.senha_painel() then
    raise exception 'Senha invalida';
  end if;
  delete from public.respostas where id = p_id;
end;
$$;

-- ---------------------------------------------------------------
-- 5. Permissões
-- ---------------------------------------------------------------
-- Por padrão o Postgres libera EXECUTE para todos; revogamos tudo
-- e devolvemos só o que cada papel precisa.

revoke all on function public.obter_cliente(uuid)         from public;
revoke all on function public.enviar_resposta(uuid, text, text) from public;
revoke all on function public.listar_painel(text)         from public;
revoke all on function public.criar_cliente(text, text)   from public;
revoke all on function public.excluir_cliente(text, uuid) from public;
revoke all on function public.excluir_resposta(text, uuid) from public;

grant execute on function public.obter_cliente(uuid)         to anon;
grant execute on function public.enviar_resposta(uuid, text, text) to anon;
grant execute on function public.listar_painel(text)         to anon;
grant execute on function public.criar_cliente(text, text)   to anon;
grant execute on function public.excluir_cliente(text, uuid) to anon;
grant execute on function public.excluir_resposta(text, uuid) to anon;
