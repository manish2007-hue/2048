export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders
    });
  }

  if (!db) {
    return new Response(JSON.stringify({ error: "Database binding unavailable" }), {
      status: 500,
      headers: corsHeaders
    });
  }

  try {
    const data = await request.json();
    const playerName = (data.playerName || "Anonymous").trim().slice(0, 20);
    const deviceId = (data.deviceId || "").trim().slice(0, 64);
    const score = Math.max(0, parseInt(data.score, 10) || 0);
    const highestTile = Math.max(2, parseInt(data.highestTile, 10) || 2);
    const moves = Math.max(0, parseInt(data.moves, 10) || 0);
    const durationSec = Math.max(0, parseInt(data.durationSec, 10) || 0);
    const didWin = data.didWin || highestTile >= 2048 ? 1 : 0;
    const now = Date.now();
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    // 1. Insert game record with device_id
    await db.prepare(`
      INSERT INTO game_records (player_name, device_id, score, highest_tile, moves, duration_sec, did_win, created_at, date_str)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(playerName, deviceId || null, score, highestTile, moves, durationSec, didWin, now, dateStr).run();

    // 2. Atomically insert or update player's career statistics in D1
    await db.prepare(`
      INSERT INTO players (name, device_id, high_score, highest_tile, games_played, wins_2048, total_score, total_moves, created_at, last_active)
      VALUES (?1, ?2, ?3, ?4, 1, ?5, ?3, ?6, ?7, ?7)
      ON CONFLICT(name) DO UPDATE SET
        device_id = COALESCE(excluded.device_id, players.device_id),
        high_score = MAX(players.high_score, excluded.high_score),
        highest_tile = MAX(players.highest_tile, excluded.highest_tile),
        games_played = players.games_played + 1,
        wins_2048 = players.wins_2048 + excluded.wins_2048,
        total_score = players.total_score + excluded.total_score,
        total_moves = players.total_moves + excluded.total_moves,
        last_active = excluded.last_active
    `).bind(playerName, deviceId || null, score, highestTile, didWin, moves, now).run();

    // 3. Retrieve updated player profile
    const updatedPlayer = await db.prepare(
      "SELECT * FROM players WHERE LOWER(name) = LOWER(?)"
    ).bind(playerName).first();

    return new Response(JSON.stringify({
      success: true,
      record: {
        playerName,
        deviceId,
        score,
        highestTile,
        moves,
        durationSec,
        didWin,
        dateStr
      },
      player: {
        name: updatedPlayer.name,
        deviceId: updatedPlayer.device_id,
        highScore: updatedPlayer.high_score,
        highestTile: updatedPlayer.highest_tile,
        gamesPlayed: updatedPlayer.games_played,
        wins2048: updatedPlayer.wins_2048,
        totalScore: updatedPlayer.total_score,
        totalMoves: updatedPlayer.total_moves
      }
    }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
