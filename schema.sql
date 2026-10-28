CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  device_id TEXT,
  high_score INTEGER DEFAULT 0,
  highest_tile INTEGER DEFAULT 2,
  games_played INTEGER DEFAULT 0,
  wins_2048 INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  total_moves INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_active INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS game_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  device_id TEXT,
  score INTEGER NOT NULL,
  highest_tile INTEGER DEFAULT 2,
  moves INTEGER DEFAULT 0,
  duration_sec INTEGER DEFAULT 0,
  did_win INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  date_str TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_players_high_score ON players(high_score DESC);
CREATE INDEX IF NOT EXISTS idx_records_score ON game_records(score DESC);
CREATE INDEX IF NOT EXISTS idx_records_player ON game_records(player_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_device ON game_records(device_id);
