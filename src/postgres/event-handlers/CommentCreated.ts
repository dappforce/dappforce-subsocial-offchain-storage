import { substrateLog as log } from '../../connections/loggers';
import { SubstrateEvent } from '../../substrate/types';
import { VirtualEvents } from '../../substrate/utils';
import { parseCommentEvent } from '../../substrate/utils';
import { insertCommentFollower } from '../inserts/insertCommentFollower';
import { insertActivityForComment } from '../inserts/insertActivityForComment';
import { fillNotificationsWithPostFollowers } from '../fills/fillNotificationsWithPostFollowers';
import { fillNotificationsWithAccountFollowers } from '../fills/fillNotificationsWithAccountFollowers';
import { insertNotificationForOwner } from '../inserts/insertNotificationForOwner';
import { NormalizedPost, asNormalizedComment } from '../../substrate/normalizers';
import { findPost } from '../../substrate/api-wrappers';
import { isEmptyStr } from '@subsocial/utils';

export const onCommentCreated = async (eventAction: SubstrateEvent, post: NormalizedPost) => {
  const { author, commentId } = parseCommentEvent(eventAction)

  const { parentId, rootPostId } = asNormalizedComment(post)

  const rootPost = await findPost(rootPostId);

  if (!rootPost) return;

  await insertCommentFollower(eventAction.data);

  const postCreator = rootPost.createdByAccount;
  const ids = [ rootPostId, commentId ];

  if (!isEmptyStr(parentId)) {
    eventAction.eventName = VirtualEvents.CommentReplyCreated
    log.debug('Comment has a parent id');
    // const parentId = parentId.unwrap();
    const param = [...ids, parentId];
    const parentComment = await findPost(parentId);

    const parentOwner = parentComment.owner.toString();
    const insertResult = await insertActivityForComment(eventAction, param, author);

    if (author === parentOwner || insertResult === undefined) return;
    await insertNotificationForOwner({ ...insertResult, account: parentOwner });
  } else {
    eventAction.eventName = VirtualEvents.CommentCreated
    const insertResult = await insertActivityForComment(eventAction, ids, postCreator);
    if (insertResult === undefined) return;

    log.debug('Comment does not have a parent id');
    await fillNotificationsWithPostFollowers(rootPostId, { account: author, ...insertResult });
    await fillNotificationsWithAccountFollowers({ account: author, ...insertResult });
  }
}
