import { CommentType, CommentsResponse } from "@/shared/types";
import { formatDate, imageProxy } from "@/utils";

import { BsArrowReturnRight } from "react-icons/bs";
import { FC } from "react";
import { idFromRef } from "@/utils/fauna";

interface CommentProps {
  comment: CommentType;
  handleGetReply: Function;
  loadedReplies: {
    [key: string]: CommentsResponse;
  };
  isReplyLoading: string[];
}

const Comment: FC<CommentProps> = ({
  comment,
  handleGetReply,
  loadedReplies,
  isReplyLoading,
}) => {
  return (
    <div key={idFromRef(comment.ref)} className="flex gap-2 mt-2">
      <div className="flex-shrink-0">
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={imageProxy(comment.user.data.photo_url)}
          alt=""
        />
      </div>
      <div className="flex-grow flex flex-col items-start">
        <div className="bg-light-100 dark:bg-dark-100 rounded-2xl px-3 py-2 text-sm">
          <h6 className="font-medium">{comment.user.data.username}</h6>
          <p>{comment.data.text}</p>
        </div>
        <div className="text-sm flex gap-3 px-3 text-zinc-400">
          <button>Like</button>
          <button>Reply</button>
          <span>{formatDate(comment.ts / 1000)}</span>
        </div>
        {comment.reply_count > 0 && !loadedReplies[idFromRef(comment.ref)] && (
          <button
            onClick={() => handleGetReply(idFromRef(comment.ref), 2)}
            className="flex items-center gap-1 text-zinc-300 text-sm ml-2 mt-1"
          >
            {isReplyLoading.includes(idFromRef(comment.ref)) ? (
              <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
            ) : (
              <BsArrowReturnRight className="fill-zinc-300" />
            )}
            <span>
              {comment.reply_count}{" "}
              {comment.reply_count > 1 ? "replies" : "reply"}
            </span>
          </button>
        )}
        {Boolean(loadedReplies[idFromRef(comment.ref)]) && (
          <div>
            {loadedReplies[idFromRef(comment.ref)].data.map((reply) => (
              <Comment
                key={idFromRef(reply.ref)}
                comment={reply}
                handleGetReply={handleGetReply}
                loadedReplies={loadedReplies}
                isReplyLoading={isReplyLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
