import Button from "@mui/material/Button";
import { useRef } from "react";
import { useSocket } from "../components/roomContext";
export default function Chat() {
    const inputRef = useRef<HTMLInputElement>(null);
    const sendMessage = useSocket().sendMessage;
    const messages = useSocket().messages
    const joinRoom = useSocket().joinRoom;
    const roomId = useSocket().roomId;
    const roomName = inputRef.current?.value
    return (
        <div className="w-full flex flex-col p-2 h-screen">
            <div className="w-full flex justify-end h-full  item-end flex-col p-2
            bg-gray-700 gap-2 rounded-lg">
                {messages.map((chat,i)=>{
                    return (
                    <div className="bg-gray-800 w-full h-10 flex flex-col gap-2 justify-end item-center rounded-2xl p-4 mt-2" key={i}>
                        {chat}
                    </div> 
                    )
                })}
                <div className="flex gap-2">
                <input className="px-4 py-2 border rounded w-3/4" ref={inputRef} placeholder={roomId?"message":"Enter Room Name"} type="text" />
                {roomId ?<Button className="w-full px-4 py-2" variant="contained" color="primary" onClick={()=>{
                    const msg = inputRef.current?.value as string;
                    sendMessage(msg);
                    if(inputRef.current) inputRef.current.value="";
                }}>Send</Button>:<Button color="primary" variant="contained"  onClick={()=>joinRoom(roomName ?? "")}>Join</Button>}
                </div>
            </div>
            
        </div>
    );
}   