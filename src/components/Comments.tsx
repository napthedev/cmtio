import {
  Comment1Response,
  CommentsResponse,
  UserSession,
} from "@/shared/types";
import { FC, useState } from "react";

import { BiLogIn } from "react-icons/bi";
import Comment from "./Comment";
import { IoMdSend } from "react-icons/io";
import { fetcher } from "@/utils/fetch";
import { idFromRef } from "@/utils/fauna";
import { imageProxy } from "@/utils";
import useSWR from "swr";
import { useSession } from "next-auth/react";

interface CommentsProps {
  siteId: string;
  slug: string;
}

const Comments: FC<CommentsProps> = ({ siteId, slug }) => {
  const [inputValue, setInputValue] = useState("");

  const [loadedReplies, setLoadedReplies] = useState<{
    [key: string]: CommentsResponse;
  }>({});
  const [isReplyLoading, setIsReplyLoading] = useState<string[]>([]);

  const { data: userData, status } = useSession();
  const user = userData as UserSession;

  const { data, error } = useSWR(
    `/api/comments?depth=1&siteId=${siteId}&slug=${encodeURIComponent(slug)}`,
    (url) => fetcher<Comment1Response>(url)
  );

  const handleGetReply = (parentId: string, depth: number) => {
    setIsReplyLoading([...new Set([...isReplyLoading, parentId])]);

    fetch(`/api/comments?depth=${depth}&parentId=${parentId}`)
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

  if (error)
    return <div className="my-6 text-center">Fail to load comments</div>;

  if (!data) return <div className="my-6 text-center">Loading comments...</div>;

  return (
    <div className="p-3">
      <div className="flex justify-between items-start mb-2">
        <p>
          {data.count} comment{data.count > 1 ? "s" : ""}
        </p>
        <div className="flex items-center">
          <button className="bg-dark-100 py-1 px-2 rounded-l">Newest</button>
          <button className="bg-dark-200 py-1 px-2 rounded-r">Oldest</button>
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
        <div
          onClick={() => {
            if (status !== "authenticated") {
              console.log("Open popup");
            }
          }}
          className={`flex-grow relative ${
            status !== "authenticated" ? "cursor-pointer" : ""
          }`}
        >
          <input
            className={`w-full h-9 outline-none bg-light-100 dark:bg-dark-100 rounded-full px-3 ${
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
          <button className="absolute right-2 top-1/2 -translate-y-1/2">
            {status === "authenticated" ? (
              <IoMdSend
                className={`h-6 w-6 transition ${
                  inputValue ? "fill-primary" : "fill-gray-400"
                }`}
              />
            ) : (
              <BiLogIn className="h-6 w-6 fill-primary" />
            )}
          </button>
        </div>
      </div>

      {data.comments.data.map((comment1) => (
        <Comment
          key={idFromRef(comment1.ref)}
          comment={comment1}
          handleGetReply={handleGetReply}
          loadedReplies={loadedReplies}
          isReplyLoading={isReplyLoading}
        />
      ))}
    </div>
  );
};

export default Comments;
