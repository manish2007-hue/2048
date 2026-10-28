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

  // GET: Fetch player profile and stats by name
  if (request.method === "GET") {
    const url = new URL(request.url);
    const name = (url.searchParams.get("name") || "").trim();

    if (!name) {
      return new Response(JSON.stringify({ error: "Player name required" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    try {
      const player = await db.prepare(
        "SELECT * FROM players WHERE LOWER(name) = LOWER(?)"
      ).bind(name).first();

      if (!player) {
        return new Response(JSON.stringify({ found: false, name }), {
          headers: corsHeaders
        });
      }

      // Fetch player's recent matches
      const recentMatches = await db.prepare(
        "SELECT * FROM game_records WHERE LOWER(player_name) = LOWER(?) ORDER BY created_at DESC LIMIT 15"
      ).bind(name).all();

      return new Response(JSON.stringify({
        found: true,
        player: {
          name: player.name,
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

  // POST: Register or touch player
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const name = (body.name || "").trim().slice(0, 20);

      if (!name) {
        return new Response(JSON.stringify({ error: "Invalid name" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const now = Date.now();
      await db.prepare(`
        INSERT INTO players (name, high_score, highest_tile, games_played, wins_2048, total_score, total_moves, created_at, last_active)
        VALUES (?, 0, 2, 0, 0, 0, 0, ?, ?)
        ON CONFLICT(name) DO UPDATE SET last_active = excluded.last_active
      `).bind(name, now, now).run();

      const player = await db.prepare(
        "SELECT * FROM players WHERE LOWER(name) = LOWER(?)"
      ).bind(name).first();

      return new Response(JSON.stringify({
        success: true,
        player: {
          name: player.name,
          highScore: player.high_score,
          highestTile: player.highest_tile,
          gamesPlayed: player.games_played,
          wins2048: player.wins_2048,
          totalScore: player.total_score,
          totalMoves: player.total_moves
        }
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
