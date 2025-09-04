import Button from "@mui/material/Button";
import { useRef } from "react";
import  joinRoom  from "../components/Appbar";
export default function Chat() {
    const inputRef = useRef<HTMLInputElement>(null);
    
    return (
        <div className="w-full flex flex-col justify-end p-4 bg-gray-800 h-screen gap-4 rounded-lg">
            <div className="w-full flex flex-row gap-2">
        <input ref = {inputRef}
            type="text"
            placeholder="message"
            className="w-3/4 p-2 rounded bg-gray-800 border border-gray-600 text-white h-10">
    </input>
    <Button
        onClick={()=>{
            if(inputRef.current){
                const message = inputRef.current.value;
                inputRef.current.value = "";
                joinRoom(message);
            }
        }}
        variant="contained"
        size="medium"
        className="w-1/4"
    >
        send
        </Button>
    </div>
</div>

    );
}   