import { pool } from '../config/db.ts';

export const DAILY_SEARCH_LIMIT = 3;

export const incrementSearchUsage = async (
  user: Express.User,
): Promise<number | null> => {
  const query = `
    INSERT INTO daily_search_usage (user_id, usage_date, search_count)
    VALUES ($1, CURRENT_DATE, 1)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET search_count = daily_search_usage.search_count + 1
    WHERE daily_search_usage.search_count < $2
    RETURNING search_count;
  `;

  try {
    const result = await pool.query(query, [user.id, DAILY_SEARCH_LIMIT]);
    return result.rows[0]?.search_count ?? null;
  } catch (error) {
    console.error('Error incrementing search usage', error);
    throw error;
  }
};

export const getSearchUsage = async (user: Express.User): Promise<number> => {
  const query = `
    SELECT search_count FROM daily_search_usage
    WHERE user_id = $1 AND usage_date = CURRENT_DATE;
  `;

  try {
    const result = await pool.query(query, [user.id]);
    return result.rows[0]?.search_count ?? 0;
  } catch (error) {
    console.error('Error fetching search usage', error);
    throw error;
  }
};
