import Button from "@mui/material/Button";


export default function Chat() {
    return (
        <div className="w-full flex flex-col justify-end p-4 bg-gray-800 h-screen gap-4 rounded-lg">
            <div className="w-full flex flex-row gap-2">
        <input
            type="text"
            placeholder="message"
            className="w-3/4 p-2 rounded bg-gray-800 border border-gray-600 text-white h-10">
    </input>
    <Button
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