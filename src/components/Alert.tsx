import { FC } from "react";
import { useEffect } from "react";

interface AlertProps {
  isOpened: boolean;
  setIsOpened: Function;
  text: string;
  duration?: number;
  isError?: boolean;
}

const Alert: FC<AlertProps> = ({
  isOpened,
  setIsOpened,
  text,
  duration = 3000,
  isError = false,
}) => {
  useEffect(() => {
    if (isOpened) {
      setTimeout(() => {
        setIsOpened(false);
      }, duration);
    }

    // eslint-disable-next-line
  }, [isOpened]);

  return (
    <div
      className={`fixed top-5 right-5 ${
        isError ? "bg-red-500" : "bg-[#323232]"
      } text-white p-4 rounded w-[calc(100vw-40px)] max-w-[300px] z-[9999] scale-100 transition-all duration-300 ${
        isOpened
          ? "opacity-100 visible scale-100"
          : "opacity-0 invisible scale-50"
      }`}
    >
      {text}
    </div>
  );
};

export default Alert;
