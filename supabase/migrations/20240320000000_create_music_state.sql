create table if not exists public.music_state (
  id uuid default gen_random_uuid() primary key,
  track_id text not null,
  track_name text not null,
  artist_name text not null,
  album_name text not null,
  album_image text not null,
  uri text not null,
  is_playing boolean default false,
  position integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.music_state enable row level security;

-- Create policy to allow all authenticated users to read and write
create policy "Allow all authenticated users to read and write music state"
  on public.music_state
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger handle_music_state_updated_at
  before update on public.music_state
  for each row
  execute function public.handle_updated_at(); 