"use client";
import React, { useEffect } from 'react'; // <-- Add useEffect
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import FileUpload from '../components/FileUpload';

const page = () => { // <-- PascalCase component name
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]); // <-- Client-side only check

  if (!session) {
    return null; // <-- Return nothing while checking
  }

  return (
    <div className='text-white mt-96'>
      {session.user.name} 
      <FileUpload/>
    </div>
  );
};

export default page;