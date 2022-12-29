import { Avatar } from "@mui/material";
import Image from "next/image";
import BookmarkOutlinedIcon from "@mui/icons-material/BookmarkOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { signOut, useSession } from "next-auth/react";
import { useSelector } from 'react-redux';
import { useEffect, useState } from "react";

function Sidebar() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUser(user);
    }
  }, []);


  return (
    <div className="space-y-2  max-w-lg mb-2">
      <div className="bg-white dark:bg-slate-800 rounded-t-lg overflow-hidden relative flex flex-col items-center text-center border border-gray-300 dark:border-none">
        <div className="relative w-full h-14">
         {user?.photoURL &&  <Image src={user?.photoURL} layout="fill" priority /> }
        </div>
        <Avatar
          onClick={signOut}
          src={user?.photoURL}
          className="!h-14 !w-14 !border-2 !absolute !top-4 !cursor-pointer"
        />
        <div className="mt-5 py-4 space-x-0.5">
          <h4 className="hover:underline decoration-purple-700 underline-offset-1 cursor-pointer">
            {user?.name}
          </h4>
          <p className="text-black/60 dark:text-white/75 text-sm">
            {user?.email}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;