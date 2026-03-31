drop policy if exists "Public delete words" on public.words;
create policy "Public delete words" on public.words
  for delete
  using (true);
