import { FC, useRef, useState } from "react";

import ClickAwayListener from "./ClickAwayListener";
import { REACTIONS_UI } from "@/shared/constant";
import { useEffectUpdate } from "@/hooks/useEffectUpdate";
import { useSession } from "next-auth/react";

interface ReactionPickerProps {
  currentUserReaction: number;
  depth: number;
  commentId: string;
  refreshReactionsData: Function;
}

const ReactionPicker: FC<ReactionPickerProps> = ({
  currentUserReaction,
  depth,
  commentId,
  refreshReactionsData,
}) => {
  const { status } = useSession();

  const [onHover, setOnHover] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const [currentReaction, setCurrentReaction] = useState(currentUserReaction);

  useEffectUpdate(() => {
    fetch(
      `/api/reactions?depth=${depth}&commentId=${commentId}&value=${currentReaction}`
    ).then(() => refreshReactionsData());
  }, [currentReaction]);

  const clearTimeOutRef = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (
    <>
      {/* Preload images */}
      {Object.keys(REACTIONS_UI).map((i) => (
        <div hidden className="hidden" key={i}>
          <img src={REACTIONS_UI[i].icon} alt="" />
          <img src={REACTIONS_UI[i].image} alt="" />
        </div>
      ))}

      <ClickAwayListener onClickAway={() => setOnHover(false)}>
        {(ref) => (
          <div
            ref={ref}
            onMouseEnter={() => {
              clearTimeOutRef();

              timeoutRef.current = setTimeout(() => {
                setOnHover(true);
              }, 300);
            }}
            onMouseLeave={() => {
              clearTimeOutRef();
              setOnHover(false);
            }}
            onTouchStart={() => {
              clearTimeOutRef();

              timeoutRef.current = setTimeout(() => {
                setOnHover(true);
              }, 300);
            }}
            onTouchEnd={() => {
              clearTimeOutRef();
              setOnHover(false);
            }}
            className={`relative cursor-pointer select-none z-10 ${
              status === "unauthenticated" ? "pointer-events-none" : ""
            }`}
          >
            <button
              className="flex gap-1 items-center"
              onClick={() => {
                clearTimeOutRef();

                currentReaction === 0
                  ? setCurrentReaction(1)
                  : setCurrentReaction(0);
                setOnHover(false);
              }}
            >
              {currentReaction === 0 ? (
                <span>Like</span>
              ) : (
                <>
                  <img
                    draggable={false}
                    className="w-4 h-4"
                    src={Object.values(REACTIONS_UI)[currentReaction - 1].icon}
                    alt=""
                  />
                  <span
                    style={{
                      color:
                        Object.values(REACTIONS_UI)[currentReaction - 1].color,
                    }}
                  >
                    {Object.keys(REACTIONS_UI)[currentReaction - 1]}
                  </span>
                </>
              )}
            </button>

            <div
              className={`w-max rounded-full absolute left-[-15px] flex gap-2 bg-light-100 dark:bg-dark-100 border border-light-200 dark:border-dark-200 p-1 top-[-36px] transition-all ${
                onHover
                  ? "translate-y-0 opacity-100 visible"
                  : "translate-y-4 opacity-0 invisible"
              }`}
            >
              {Object.keys(REACTIONS_UI).map((i, index) => (
                <div
                  data-content={i}
                  key={i}
                  className="relative hover:before:content-[attr(data-content)] before:opacity-0 before:transition hover:before:opacity-100 before:absolute before:-top-9 before:z-10 hover:before:bg-white dark:hover:before:bg-dark before:text-zinc-800 dark:before:text-gray-200 before:left-1/2 before:-translate-x-1/2 before:rounded-full before:px-2"
                  onTouchEnd={() => {
                    setCurrentReaction(index + 1);
                    setOnHover(false);
                  }}
                  onClick={() => {
                    setCurrentReaction(index + 1);
                    setOnHover(false);
                  }}
                >
                  <img
                    className="w-7 h-7 transition duration-300 hover:scale-[120%] active:scale-95 origin-bottom transform scale-100 rounded-full relative pointer-events-none select-none"
                    draggable={false}
                    key={i}
                    src={REACTIONS_UI[i].image}
                    alt=""
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </ClickAwayListener>
    </>
  );
};

export default ReactionPicker;
