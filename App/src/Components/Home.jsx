import { useContext, useState } from "react"
import { AppContext } from "../App"
import SideBar from "./SideBar"
import { motion } from "framer-motion" 
import ChatContainer from "./ChatContainer"

export default function Home() {
    // get the current user from the context
    const { currentUser, openedChat } = useContext(AppContext)
    
    return (
        <div className="w-full min-h-screen bg-primary-600 flex justify-center items-center px-10">
            <motion.div
                initial={{opacity: 0, scale: 0.5}}
                animate={{opacity: 1, scale: 1}}
                transition={{
                    type: 'tween',
                    duration: 0.3
                }}  
                className="w-full max-w-[900px] min-h-[600px] bg-secondary-600 rounded-3xl shadow-profile overflow-hidden flex">
                <SideBar />
                <ChatContainer id={openedChat} />
                {/* id={'64aad0f6e3037ab7d995f252'} */}
            </motion.div>
        </div>
    )
}