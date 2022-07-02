import { CommentType, CommentsResponse, UserSession } from "@/shared/types";
import { FC, FormEvent, useState } from "react";
import { formatDate, imageProxy } from "@/utils";

import { BsArrowReturnRight } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { idFromRef } from "@/utils/fauna";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import ReactionPicker from "./ReactionPicker";
import { REACTIONS_UI } from "@/shared/constant";

interface CommentProps {
  comment: CommentType;
  handleGetReply: Function;
  loadedReplies: {
    [key: string]: CommentsResponse;
  };
  isReplyLoading: string[];
  setLoadedReplies: Function;
  depth: number;
  parentId?: string;
  mutate: Function;
}

const Comment: FC<CommentProps> = ({
  parentId,
  comment,
  handleGetReply,
  loadedReplies,
  isReplyLoading,
  setLoadedReplies,
  depth,
  mutate,
}) => {
  const { data: userData, status } = useSession();
  const user = userData as UserSession;

  const router = useRouter();
  const { siteId, slug } = router.query;

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || status !== "authenticated" || isSubmitLoading)
      return;

    setInputValue("");
    setIsSubmitLoading(true);

    fetch(`/api/write-comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        siteId,
        slug,
        // max input size is 5000
        text: inputValue.trim().slice(0, 5000),
        parentId: idFromRef(comment.ref),
        // reply depth must be above 1 unit
        depth: depth + 1,
      }),
    }).finally(() => {
      handleGetReply(idFromRef(comment.ref), depth + 1).finally(() => {
        setIsSubmitLoading(false);
      });
    });
  };

  const refreshReactionsData = () => {
    if (depth === 1) {
      mutate();
    } else {
      fetch(`/api/comments?depth=${depth}&parentId=${parentId}`)
        .then((res) => res.json())
        .then((data) => {
          setLoadedReplies((prev: any) => {
            const clone = JSON.parse(JSON.stringify(prev));
            clone[parentId as string] = data;
            return clone;
          });
        });
    }
  };

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
        <div
          className={`bg-light-100 dark:bg-dark-100 rounded-2xl px-3 py-2 text-sm relative ${
            comment.reactions.length > 0 ? "mb-3" : ""
          }`}
        >
          <h6 className="font-medium">{comment.user.data.username}</h6>
          <p style={{ wordWrap: "break-word", wordBreak: "break-word" }}>
            {comment.data.text}
          </p>

          {comment.reactions.length > 0 && (
            <div className="absolute bottom-0 right-0 translate-y-1/2 bg-gray-200 dark:bg-[#3E4042] rounded-full flex items-center px-1 gap-1 py-[2px]">
              <div
                className="flex items-center overflow-hidden"
                style={{
                  width:
                    comment.reactions.slice(0, 3).length * 18 -
                    (comment.reactions.slice(0, 3).length - 1) * 5,
                }}
              >
                {comment.reactions
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map((icon, index) => (
                    <img
                      style={{
                        transform: `translateX(-${5 * index}px)`,
                        zIndex: 3 - index,
                      }}
                      key={icon.value}
                      className="w-[18px] h-[18px] rounded-full"
                      src={
                        Object.values(REACTIONS_UI)[Number(icon.value) - 1]
                          .image
                      }
                      alt=""
                    />
                  ))}
              </div>
              <span>
                {comment.reactions.reduce((acc, reaction) => {
                  acc += reaction.count;
                  return acc;
                }, 0)}
              </span>
            </div>
          )}
        </div>
        <div className="text-sm flex gap-3 px-3 text-zinc-500 dark:text-zinc-400">
          <ReactionPicker
            currentUserReaction={comment.current_user_reaction || 0}
            commentId={idFromRef(comment.ref)}
            depth={depth}
            refreshReactionsData={refreshReactionsData}
          />

          <button
            onClick={async () => {
              // if depth = 3 (max depth) reply to its parent with the depth of 2
              if (depth === 3) {
                setTimeout(() => {
                  document.getElementById(`reply-${parentId}`)?.focus();
                }, 100);
              } else {
                await handleGetReply(idFromRef(comment.ref), depth + 1);

                setTimeout(() => {
                  document
                    .getElementById(`reply-${idFromRef(comment.ref)}`)
                    ?.focus();
                }, 100);
              }
            }}
          >
            Reply
          </button>
          <span>{formatDate(comment.ts / 1000)}</span>
        </div>

        {/* only show replies and input box if depth is not 3 */}

        {depth !== 3 &&
          comment.reply_count > 0 &&
          !loadedReplies[idFromRef(comment.ref)] && (
            <button
              onClick={() => handleGetReply(idFromRef(comment.ref), 2)}
              className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 text-sm ml-2 mt-1"
            >
              {isReplyLoading.includes(idFromRef(comment.ref)) ? (
                <span className="w-3 h-3 rounded-full border-2 border-zinc-600 dark:border-zinc-300 !border-t-transparent animate-spin"></span>
              ) : (
                <BsArrowReturnRight className="fill-zinc-600 dark:fill-zinc-300" />
              )}
              <span>
                {comment.reply_count}{" "}
                {comment.reply_count > 1 ? "replies" : "reply"}
              </span>
            </button>
          )}

        {depth !== 3 && Boolean(loadedReplies[idFromRef(comment.ref)]) && (
          <div className="w-full">
            {loadedReplies[idFromRef(comment.ref)].data.map((reply) => (
              <Comment
                key={idFromRef(reply.ref)}
                comment={reply}
                handleGetReply={() => handleGetReply(idFromRef(reply.ref), 3)}
                loadedReplies={loadedReplies}
                isReplyLoading={isReplyLoading}
                setLoadedReplies={setLoadedReplies}
                depth={depth + 1}
                parentId={idFromRef(comment.ref)}
                mutate={mutate}
              />
            ))}

            {status !== "unauthenticated" && (
              <div className="flex gap-2 items-center my-2">
                <div>
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={
                      user?.user?.image
                        ? imageProxy(user.user.image)
                        : "/default-avatar.png"
                    }
                    alt=""
                  />
                </div>
                <form
                  autoComplete="off"
                  onSubmit={handleFormSubmit}
                  className={`flex-grow relative ${
                    status !== "authenticated" ? "cursor-pointer" : ""
                  }`}
                >
                  <input
                    id={`reply-${idFromRef(comment.ref)}`}
                    className={`w-full h-9 outline-none bg-light-100 dark:bg-dark-100 rounded-full pl-3 pr-10 ${
                      status !== "authenticated" ? "cursor-pointer" : ""
                    }`}
                    type="text"
                    placeholder={`Reply to ${
                      comment.user.data.email === user?.user?.email
                        ? "yourself"
                        : comment.user.data.username
                    }...`}
                    readOnly={!(status === "authenticated")}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  {isSubmitLoading ? (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-gray-400 animate-spin"></div>
                    </div>
                  ) : (
                    <button className="absolute right-2 top-1/2 -translate-y-1/2">
                      <IoMdSend
                        className={`h-6 w-6 transition ${
                          inputValue.trim() ? "fill-primary" : "fill-gray-400"
                        }`}
                      />
                    </button>
                  )}
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
