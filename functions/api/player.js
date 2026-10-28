export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!db) {
    return new Response(JSON.stringify({ error: "Database binding unavailable" }), {
      status: 500,
      headers: corsHeaders
    });
  }

  // GET: Fetch player profile and stats by name or device_id
  if (request.method === "GET") {
    const url = new URL(request.url);
    const name = (url.searchParams.get("name") || "").trim();
    const deviceId = (url.searchParams.get("deviceId") || "").trim();

    if (!name && !deviceId) {
      return new Response(JSON.stringify({ error: "Player name or deviceId required" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    try {
      let player = null;
      if (name) {
        player = await db.prepare(
          "SELECT * FROM players WHERE LOWER(name) = LOWER(?)"
        ).bind(name).first();
      }

      if (!player && deviceId) {
        player = await db.prepare(
          "SELECT * FROM players WHERE device_id = ? ORDER BY last_active DESC LIMIT 1"
        ).bind(deviceId).first();
      }

      if (!player) {
        return new Response(JSON.stringify({ found: false, name, deviceId }), {
          headers: corsHeaders
        });
      }

      // Fetch every game play recorded for this player or on this device
      let recentMatches;
      if (deviceId) {
        recentMatches = await db.prepare(`
          SELECT * FROM game_records 
          WHERE LOWER(player_name) = LOWER(?) OR (device_id = ? AND device_id IS NOT NULL)
          ORDER BY created_at DESC LIMIT 50
        `).bind(player.name, deviceId).all();
      } else {
        recentMatches = await db.prepare(
          "SELECT * FROM game_records WHERE LOWER(player_name) = LOWER(?) ORDER BY created_at DESC LIMIT 50"
        ).bind(player.name).all();
      }

      return new Response(JSON.stringify({
        found: true,
        player: {
          name: player.name,
          deviceId: player.device_id,
          highScore: player.high_score,
          highestTile: player.highest_tile,
          gamesPlayed: player.games_played,
          wins2048: player.wins_2048,
          totalScore: player.total_score,
          totalMoves: player.total_moves,
          createdAt: player.created_at,
          lastActive: player.last_active
        },
        records: recentMatches.results || []
      }), { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  // POST: Login / Register player and bind to device_id
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const name = (body.name || "").trim().slice(0, 20);
      const deviceId = (body.deviceId || "").trim().slice(0, 64);

      if (!name) {
        return new Response(JSON.stringify({ error: "Invalid name" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const now = Date.now();
      await db.prepare(`
        INSERT INTO players (name, device_id, high_score, highest_tile, games_played, wins_2048, total_score, total_moves, created_at, last_active)
        VALUES (?1, ?2, 0, 2, 0, 0, 0, 0, ?3, ?3)
        ON CONFLICT(name) DO UPDATE SET 
          device_id = COALESCE(excluded.device_id, players.device_id),
          last_active = excluded.last_active
      `).bind(name, deviceId || null, now).run();

      const player = await db.prepare(
        "SELECT * FROM players WHERE LOWER(name) = LOWER(?)"
      ).bind(name).first();

      // Also get any previous records
      const records = await db.prepare(`
        SELECT * FROM game_records 
        WHERE LOWER(player_name) = LOWER(?) OR (device_id = ? AND device_id IS NOT NULL)
        ORDER BY created_at DESC LIMIT 50
      `).bind(name, deviceId || "").all();

      return new Response(JSON.stringify({
        success: true,
        player: {
          name: player.name,
          deviceId: player.device_id,
          highScore: player.high_score,
          highestTile: player.highest_tile,
          gamesPlayed: player.games_played,
          wins2048: player.wins_2048,
          totalScore: player.total_score,
          totalMoves: player.total_moves
        },
        records: records.results || []
      }), { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: corsHeaders
  });
}
