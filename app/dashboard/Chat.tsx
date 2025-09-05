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
        <div className="w-full flex flex-col justify-end p-4 bg-gray-800 h-screen gap-4 rounded-lg">
            <div>
                <input ref={inputRef} placeholder={roomId?"message":"Enter Room Name"} type="text" />
                {roomId ?<Button variant="contained" color="primary" onClick={()=>{
                    const msg = inputRef.current?.value as string;
                    sendMessage(msg);
                    if(inputRef.current) inputRef.current.value="";
                }}>Send</Button>:<Button onClick={()=>joinRoom(roomName ?? "")}>Join</Button>}
                
            </div>
            <div className="overflow-y-scroll h-full">
                {messages.map((msg, i) => (
                    <div key={i}>{msg}</div>
                ))}
            </div>
        </div>
    );
}   