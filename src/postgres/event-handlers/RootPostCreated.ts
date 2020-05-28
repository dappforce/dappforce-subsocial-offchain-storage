import { Post } from '@subsocial/types/substrate/interfaces/subsocial';
import { insertPostFollower } from '../insert-follower';
import { insertActivityForPost } from '../insert-activity';
import { fillNewsFeedWithAccountFollowers, fillNewsFeedWithBlogFollowers } from '../fill-activity';
import { SubstrateEvent } from '../../substrate/types';
import { parsePostEvent } from '../../substrate/utils';


export const onRootCreated = async (eventAction: SubstrateEvent, post: Post) => {
  const { author, postId } = parsePostEvent(eventAction)

  await insertPostFollower(eventAction.data);

  const blogId = post.blog_id.unwrap()
  const ids = [blogId, postId ];
  const activityId = await insertActivityForPost(eventAction, ids, 0);
  if (activityId === -1) return;

  await fillNewsFeedWithBlogFollowers(blogId, author, activityId);
  await fillNewsFeedWithAccountFollowers(author, activityId);
}
