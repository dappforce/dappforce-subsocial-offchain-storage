import { pg } from '../connections/connect-postgres';
import { log, insertActivityLog, insertActivityLogError } from './postges-logger';
import { informClientAboutUnreadNotifications } from '../express-api/events';

export const insertNotificationForOwner = async (id: number, account: string) => {
  const params = [ account, id ]
  const query = `
    INSERT INTO df.notifications
      VALUES($1, $2) 
    RETURNING *`

  try {
    await pg.query(query, params)
    insertActivityLog('owner')
    await updateCountOfUnreadNotifications(account)
  } catch (err) {
    insertActivityLogError('owner', err.stack)
    throw insertActivityLogError
  }
}

export type AggCountProps = {
  eventName: string,
  account: string,
  post_id: number
}

export const getAggregationCount = async (props: AggCountProps) => {
  const { eventName, post_id, account } = props;
  const params = [ account, eventName, post_id ];
  const query = `
    SELECT count(distinct account)
    FROM df.activities
    WHERE account <> $1
      AND event = $2
      AND post_id = $3`

  try {
    const res = await pg.query(query, params)
    log.info(`Get ${res.rows[0].count} distinct activities by post id: ${post_id}`)
    return res.rows[0].count as number;
  } catch (err) {
    log.error('Failed to getAggregationCount:', err.stack)
    throw err
    return 0;
  }
}

export const updateCountOfUnreadNotifications = async (account: string) => {
  const query = `
    INSERT INTO df.notifications_counter 
      (account, last_read_activity_id, unread_count)
    VALUES ($1, 0, 1)
    ON CONFLICT (account) DO UPDATE
    SET unread_count = (
      SELECT DISTINCT COUNT(*)
      FROM df.activities
      WHERE aggregated = true AND id IN ( 
        SELECT activity_id
        FROM df.notifications
        WHERE account = $1 AND activity_id > (
          SELECT last_read_activity_id
          FROM df.notifications_counter
          WHERE account = $1
        )
      )
    )`

  try {
    const res = await pg.query(query, [ account ])
    log.debug(`Successfully updated unread notifications by account ${account}. Query result: ${res.rows}`)
    const currentUnreadCount = await getCountOfUnreadNotifications(account)
    informClientAboutUnreadNotifications(account, currentUnreadCount);
  } catch (err) {
    log.error(`Failed to update unread notifications by account ${account}. Error: %s`, err.stack);
    throw err
  }
}

export const getCountOfUnreadNotifications = async (account: string) => {
  const query = `
    SELECT unread_count
    FROM df.notifications_counter
    WHERE account = $1
  `
  try {
    const res = await pg.query(query, [ account ])
    log.debug(`Found ${res.rows[0].unread_count} unread notifications by account ${account}`)
    return res.rows[0].unread_count as number;
  } catch (err) {
    log.error(`Failed to get a count of unread notifications by account ${account}. Error: %s`, err.stack);
    throw err
    return 0
  }
}
