import {
  Comment1Response,
  CommentsResponse,
  UserSession,
} from "@/shared/types";
import { FC, FormEvent, useEffect, useRef, useState } from "react";

import { FaSignInAlt } from "react-icons/fa";
import Comment from "./Comment";
import { IoMdSend } from "react-icons/io";
import { fetcher } from "@/utils/fetch";
import { idFromRef } from "@/utils/fauna";
import { imageProxy, joinQueryString } from "@/utils";
import { useFetch } from "@/hooks/useFetch";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffectUpdate } from "@/hooks/useEffectUpdate";

const Comments: FC = () => {
  const router = useRouter();

  const { siteId, slug, oldest, commentsPerPage } = router.query as {
    [key: string]: string;
  };

  const [limit, setLimit] = useState(Number(commentsPerPage) || 5);

  const [inputValue, setInputValue] = useState("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  const [loadedReplies, setLoadedReplies] = useState<{
    [key: string]: CommentsResponse;
  }>({});
  const [isReplyLoading, setIsReplyLoading] = useState<string[]>([]);

  const [isLoadingNewComments, setIsLoadingNewComments] = useState(false);

  const [isSortedByOldest, setIsSortedByOldest] = useState(oldest === "1");

  const popupCheckInterval = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const { data: userData, status } = useSession();
  const user = userData as UserSession;

  const { data, error, mutate } = useFetch(
    `/api/comments?depth=1&siteId=${siteId}&slug=${encodeURIComponent(
      slug
    )}&limit=${limit}&oldest=${Number(isSortedByOldest)}`,
    (url) => fetcher<Comment1Response>(url)
  );

  useEffect(() => {
    setIsLoadingNewComments(false);
  }, [data?.comments.data.length]);

  useEffectUpdate(() => {
    router.push(
      `/embed?${joinQueryString({
        ...router.query,
        oldest: Number(isSortedByOldest),
      })}`
    );
  }, [isSortedByOldest]);

  // Get replies (depth=2|3)
  const handleGetReply = async (parentId: string, depth: number) => {
    setIsReplyLoading([...new Set([...isReplyLoading, parentId])]);

    await fetch(`/api/comments?depth=${depth}&parentId=${parentId}`)
      .then((res) => res.json())
      .then((data) => {
        setLoadedReplies((prev) => {
          const clone = JSON.parse(JSON.stringify(prev));
          clone[parentId] = data;
          return clone;
        });
      })
      .finally(() =>
        setIsReplyLoading((prev) =>
          [...prev].filter((item) => item !== parentId)
        )
      );
  };

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
        depth: 1,
        siteId,
        slug,
        // max input length is 5000
        text: inputValue.trim().slice(0, 5000),
      }),
    }).finally(() => {
      mutate().finally(() => {
        setIsSubmitLoading(false);
      });
    });
  };

  if (error)
    return <div className="my-6 text-center">Failed to load comments</div>;

  if (!data) return <div className="my-6 text-center">Loading comments...</div>;

  return (
    <>
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <p>
            {data.count} comment{data.count > 1 ? "s" : ""}
          </p>
          <div className="flex items-center">
            <button
              onClick={() => setIsSortedByOldest(false)}
              className={`py-1 px-2 rounded-l ${
                !isSortedByOldest
                  ? "bg-light-200 dark:bg-dark-100 border border-stone-300 dark:border-stone-700"
                  : "bg-light-100 dark:bg-dark-200"
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setIsSortedByOldest(true)}
              className={`py-1 px-2 rounded-r ${
                isSortedByOldest
                  ? "bg-light-200 dark:bg-dark-100 border border-stone-300 dark:border-stone-700"
                  : "bg-light-100 dark:bg-dark-200"
              }`}
            >
              Oldest
            </button>
          </div>
        </div>
        <div className="flex gap-2 items-center">
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
            onClick={() => {
              if (status !== "authenticated") {
                // same width and height
                const size = 400;

                // https://stackoverflow.com/questions/4068373/center-a-popup-window-on-screen
                const dualScreenLeft =
                  window.screenLeft !== undefined
                    ? window.screenLeft
                    : window.screenX;
                const dualScreenTop =
                  window.screenTop !== undefined
                    ? window.screenTop
                    : window.screenY;

                const width = window.innerWidth
                  ? window.innerWidth
                  : document.documentElement.clientWidth
                  ? document.documentElement.clientWidth
                  : screen.width;
                const height = window.innerHeight
                  ? window.innerHeight
                  : document.documentElement.clientHeight
                  ? document.documentElement.clientHeight
                  : screen.height;

                const systemZoom = width / window.screen.availWidth;
                const left = (width - size) / 2 / systemZoom + dualScreenLeft;
                const top = (height - size) / 2 / systemZoom + dualScreenTop;

                const popupWindow = window.open(
                  "/sign-in-popup",
                  "Sign in to CmtIO",
                  `scrollbars=yes,width=${size / systemZoom},height=${
                    size / systemZoom
                  },left=${left},top=${top}`
                );

                // check when the popup is closed
                popupCheckInterval.current = setInterval(() => {
                  if (popupWindow?.closed) {
                    // ask next-auth to refresh the session
                    const event = new Event("visibilitychange");
                    document.dispatchEvent(event);

                    clearInterval(popupCheckInterval.current as any);
                  }
                }, 200);
              }
            }}
            className={`flex-grow relative ${
              status !== "authenticated" ? "cursor-pointer" : ""
            }`}
          >
            <input
              className={`w-full h-9 outline-none bg-light-100 dark:bg-dark-100 rounded-full pl-3 pr-10 ${
                status !== "authenticated" ? "cursor-pointer" : ""
              }`}
              type="text"
              placeholder={
                status === "authenticated"
                  ? "Write a comment..."
                  : "Please sign in to comment"
              }
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
                {status === "authenticated" ? (
                  <IoMdSend
                    className={`h-6 w-6 transition ${
                      inputValue.trim() ? "fill-primary" : "fill-gray-400"
                    }`}
                  />
                ) : (
                  <FaSignInAlt className="h-6 w-6 fill-primary" />
                )}
              </button>
            )}
          </form>
        </div>

        {data.comments.data.length === 0 && (
          <div className="my-6 text-center">Be the first one to comment</div>
        )}

        {data.comments.data.map((comment1) => (
          <Comment
            key={idFromRef(comment1.ref)}
            comment={comment1}
            handleGetReply={handleGetReply}
            loadedReplies={loadedReplies}
            isReplyLoading={isReplyLoading}
            setLoadedReplies={setLoadedReplies}
            depth={1}
            mutate={mutate}
          />
        ))}

        {(isLoadingNewComments || limit <= data.comments.data.length) && (
          <div className="mt-2">
            {isLoadingNewComments ? (
              <span className="text-zinc-500 dark:text-zinc-400">
                View more comments...
              </span>
            ) : (
              <button
                onClick={() => {
                  setIsLoadingNewComments(true);
                  setLimit(limit + Number(commentsPerPage) || 5);
                }}
                className="text-zinc-500 dark:text-zinc-400 hover:underline"
              >
                View more comments
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Comments;
