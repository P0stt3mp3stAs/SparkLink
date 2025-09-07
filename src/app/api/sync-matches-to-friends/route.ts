// src/app/api/sync-matches-to-friends/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST() {
  try {
    console.log("🔄 Starting sync-matches-to-friends...");
    
    // First, get all mutual matches
    const mutualMatchesResult = await pool.query(`
      SELECT
        m1.user_id AS user_a,
        friend_id AS user_b
      FROM "match" m1
      CROSS JOIN unnest(m1.matches) AS friend_id
      JOIN "match" m2 ON m2.user_id = friend_id
      WHERE m2.matches @> ARRAY[m1.user_id]
    `);

    const mutualMatches = mutualMatchesResult.rows;
    console.log("🔍 Found mutual matches:", mutualMatches.length);
    
    if (mutualMatches.length === 0) {
      console.log("✅ No mutual matches found to sync");
      return NextResponse.json({ 
        success: true, 
        message: "No mutual matches found to sync" 
      });
    }

    // For each mutual match, update both users' friend lists
    for (const match of mutualMatches) {
      const { user_a, user_b } = match;
      
      // Check if this mutual match already exists in friends table
      const existingCheck = await pool.query(
        `SELECT 1 FROM friends 
         WHERE user_id = $1 AND friends @> ARRAY[$2]::uuid[]`,
        [user_a, user_b]
      );

      // Only proceed if this is a NEW mutual match
      if (existingCheck.rows.length === 0) {
        console.log(`🤝 New mutual match detected: ${user_a} and ${user_b}`);
        
        // Add user_b to user_a's friends list
        const userAFriendsRes = await pool.query(
          'SELECT friends FROM friends WHERE user_id = $1',
          [user_a]
        );
        
        if (userAFriendsRes.rows.length === 0) {
          await pool.query(
            'INSERT INTO friends (user_id, friends) VALUES ($1, ARRAY[$2]::uuid[])',
            [user_a, user_b]
          );
        } else {
          const currentFriends = userAFriendsRes.rows[0].friends || [];
          if (!currentFriends.includes(user_b)) {
            await pool.query(
              'UPDATE friends SET friends = array_append(friends, $1) WHERE user_id = $2',
              [user_b, user_a]
            );
          }
        }
        
        // Add user_a to user_b's friends list
        const userBFriendsRes = await pool.query(
          'SELECT friends FROM friends WHERE user_id = $1',
          [user_b]
        );
        
        if (userBFriendsRes.rows.length === 0) {
          await pool.query(
            'INSERT INTO friends (user_id, friends) VALUES ($1, ARRAY[$2]::uuid[])',
            [user_b, user_a]
          );
        } else {
          const currentFriends = userBFriendsRes.rows[0].friends || [];
          if (!currentFriends.includes(user_a)) {
            await pool.query(
              'UPDATE friends SET friends = array_append(friends, $1) WHERE user_id = $2',
              [user_a, user_b]
            );
          }
        }

        // CREATE NOTIFICATIONS FOR BOTH USERS (WITH ERROR HANDLING)
        try {
          await pool.query(
            `INSERT INTO notifications (user_id, from_user_id, type, message) 
             VALUES ($1, $2, 'match', 'You have a new match!')`,
            [user_a, user_b]
          );

          await pool.query(
            `INSERT INTO notifications (user_id, from_user_id, type, message) 
             VALUES ($1, $2, 'match', 'You have a new match!')`,
            [user_b, user_a]
          );
          
          console.log(`✅ Notifications created for ${user_a} and ${user_b}`);
        } catch (notifError) {
          console.error('❌ Error creating notifications:', notifError);
          // CONTINUE EVEN IF NOTIFICATIONS FAIL - DON'T BREAK THE WHOLE SYNC
        }

        console.log(`✅ SUCCESS: ${user_a} and ${user_b} are now friends!`);
        
      } else {
        console.log(`📝 Match already exists in friends: ${user_a} and ${user_b}`);
      }
    }

    console.log("✅ Sync completed successfully");
    return NextResponse.json({ 
      success: true, 
      synced: mutualMatches.length,
      message: `Successfully synced ${mutualMatches.length} mutual matches to friends`
    });
  } catch (err) {
    console.error("❌ sync-matches-to-friends error:", err);
    return NextResponse.json(
      { error: "Failed to sync matches", details: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}