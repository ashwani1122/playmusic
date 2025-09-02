    "use client"
import {  signIn, signOut, useSession } from "next-auth/react";
import * as React from 'react';
import  Button  from "@mui/material/Button";
export default function Appbar() {
    const session = useSession();
    return (
       <div className="bg-gradient-to-r from-purple-700 to-purple-400 fixed top-0 left-0 w-full z-50">
  <div className="flex justify-between items-center px-6 py-4 text-white">
    <h1 className="text-xl font-bold">Play Music</h1>
    
    <div>
      {session?.data?.user ? (
        <Button variant="contained" color="primary" onClick={() => signOut()}>
          Logout
        </Button>
      ) : (
        <Button variant="contained" color="primary" onClick={() => signIn()}>
          Login
        </Button>
      )}
    </div>
  </div>
</div>

    )
}