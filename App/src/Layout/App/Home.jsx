import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import SideBar from "../../Components/SideBar/SideBar.jsx";
import { motion } from "framer-motion";
import ChatContainer from "../../Components/Chat/ChatContainer.jsx";
import { useDispatch, useSelector } from "react-redux";
import { loading as GlobalLoading } from "../../Store/Global/index.js";
import socketContext from "../../Context/LoadSocket.js";

export default function Home() {
  const [ref, bounds] = useMeasure();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const global = useSelector((state) => state.global);

  useEffect(() => {
    dispatch(GlobalLoading(false));
    return () => {
      dispatch(GlobalLoading(true));
    };
  }, []);
  return (
    auth.user && (
      <div
        key={"Home"}
        className="w-full min-h-screen bg-primary-700 flex justify-center items-center 
      px-[10px] lg:px-0"
      >
        <div
          ref={ref}
          className="relative w-full max-w-[1000px] min-h-screen  
        overflow-hidden flex justify-stretch gap-[20px] items-stretch @container/home"
        >
          <SideBar bounds={bounds} />
          <ChatContainer bounds={bounds} />
        </div>
      </div>
    )
  );
}
