export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
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

  // DELETE: Clear rank board history
  if (request.method === "DELETE") {
    try {
      const url = new URL(request.url);
      const action = url.searchParams.get("action");
      if (action === "clear_all") {
        await db.prepare("DELETE FROM game_records").run();
        await db.prepare("DELETE FROM players").run();
        return new Response(JSON.stringify({ success: true, message: "All rank board history wiped clean" }), {
          headers: corsHeaders
        });
      }
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: corsHeaders
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "all";
    const playerName = (url.searchParams.get("name") || "").trim();
    const deviceId = (url.searchParams.get("deviceId") || "").trim();

    let query = "";
    let params = [];

    if (filter === "mine") {
      if (playerName && deviceId) {
        query = `
          SELECT * FROM game_records 
          WHERE LOWER(player_name) = LOWER(?) OR (device_id = ? AND device_id IS NOT NULL)
          ORDER BY score DESC, highest_tile DESC LIMIT 50
        `;
        params = [playerName, deviceId];
      } else if (playerName) {
        query = "SELECT * FROM game_records WHERE LOWER(player_name) = LOWER(?) ORDER BY score DESC, highest_tile DESC LIMIT 50";
        params = [playerName];
      } else if (deviceId) {
        query = "SELECT * FROM game_records WHERE device_id = ? ORDER BY score DESC, highest_tile DESC LIMIT 50";
        params = [deviceId];
      } else {
        query = "SELECT * FROM game_records ORDER BY score DESC, highest_tile DESC LIMIT 50";
      }
    } else if (filter === "today") {
      // Past 24 hours / today filter
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      query = "SELECT * FROM game_records WHERE created_at >= ? ORDER BY score DESC, highest_tile DESC LIMIT 50";
      params = [oneDayAgo];
    } else {
      // Default: All-Time best game records
      query = "SELECT * FROM game_records ORDER BY score DESC, highest_tile DESC LIMIT 50";
    }

    const { results } = await db.prepare(query).bind(...params).all();

    // Map DB fields to frontend format
    const runs = (results || []).map(r => ({
      id: r.id,
      playerName: r.player_name,
      deviceId: r.device_id,
      score: r.score,
      highestTile: r.highest_tile,
      moves: r.moves,
      durationSec: r.duration_sec,
      didWin2048: r.did_win === 1,
      dateStr: r.date_str,
      timestamp: r.created_at
    }));

    // Top player overall summary for stats
    const topPlayer = await db.prepare(
      "SELECT name, high_score, highest_tile FROM players ORDER BY high_score DESC LIMIT 1"
    ).first();

    return new Response(JSON.stringify({
      success: true,
      filter,
      totalCount: runs.length,
      runs,
      topOverall: topPlayer ? {
        name: topPlayer.name,
        highScore: topPlayer.high_score,
        highestTile: topPlayer.highest_tile
      } : null
    }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
