'use client'
import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  if(session) {
    return <>
      Signed in as {session.user.email} <br/>
      <button onClick={() => signOut()}>Sign out</button>
    </>
  }
  return <>
   <div className="text-red">
    
   Not signed in <br/>
    <button onClick={() => signIn("github")} >Sign in With github</button>
    <button onClick={() => signIn("google")} >Sign in With google</button>
   </div>
  </>
}