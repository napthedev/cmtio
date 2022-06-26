import { FC, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import ClickAwayListener from "./ClickAwayListener";
import { FaUser } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import Link from "next/link";
import { imageProxy } from "@/utils";

const Navbar: FC = () => {
  const { data } = useSession();
  const user = data?.user;

  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  return (
    <div className="h-14 shadow dark:shadow-gray-600 flex justify-between items-center px-6">
      <Link href="/">
        <a className="flex items-center gap-2">
          <img className="w-8 h-8" src="/icon.png" alt="" />
          <span className="text-xl">CmtIO</span>
        </a>
      </Link>
      <ClickAwayListener onClickAway={() => setIsDropdownOpened(false)}>
        {(ref) => (
          <div ref={ref} className="relative">
            <button onClick={() => setIsDropdownOpened(!isDropdownOpened)}>
              <img
                className="w-8 h-8 rounded-full"
                src={imageProxy(user?.image as string)}
                alt=""
              />
            </button>
            <div
              className={`absolute top-full right-0 py-2 flex flex-col items-stretch [&>*]:whitespace-nowrap bg-dark-100 rounded-md transition-all ${
                isDropdownOpened ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <Link href="/profile">
                <a className="flex items-center gap-2 px-3 py-2 bg-dark-100 hover:brightness-125 transition">
                  <FaUser className="fill-white w-6 h-5" />
                  <span>Profile</span>
                </a>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-2 bg-dark-100 hover:brightness-125 transition"
              >
                <IoLogOutOutline className="fill-white w-6 h-6" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </ClickAwayListener>
    </div>
  );
};

export default Navbar;
