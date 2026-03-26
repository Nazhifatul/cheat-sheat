drop policy if exists "Public insert words" on public.words;
create policy "Public insert words" on public.words
  for insert
  with check (char_length(word) between 1 and 256);

