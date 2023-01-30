import React, { useEffect } from "react";
import { auth } from "../firebase";

import { useRouter } from "next/router";


export default function Verify() {

    const router = useRouter()

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                if (user.emailVerified) {
                    router.push('/')
                }
            } else {
                router.push('/login')
            }
        })
    }, [])


  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw'}}>
        <h1 style={{color: 'red'}}>Verify your email address to containue. We have sent you an email with a link to verify your email address. 
        After you verify your email address, reload this page.</h1>
    </div>

  )
}
