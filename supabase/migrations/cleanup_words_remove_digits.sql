with cleaned as (
  select
    id,
    created_at,
    trim(
      regexp_replace(
        regexp_replace(word, '[0-9]+', '', 'g'),
        '\s+',
        ' ',
        'g'
      )
    ) as new_word
  from public.words
),
empties as (
  select id
  from cleaned
  where new_word = ''
),
ranked as (
  select
    id,
    new_word,
    row_number() over (
      partition by lower(new_word)
      order by created_at desc, id desc
    ) as rn
  from cleaned
  where new_word <> ''
),
dupes as (
  select id
  from ranked
  where rn > 1
)
delete from public.words
where id in (select id from empties)
   or id in (select id from dupes);

update public.words w
set word = c.new_word
from cleaned c
where w.id = c.id
  and c.new_word <> ''
  and w.word <> c.new_word;

