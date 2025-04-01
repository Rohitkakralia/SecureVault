"use client";
import React, { useEffect, useState } from 'react';
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import FileUpload from '../components/FileUpload';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return <div className="text-white mt-96">Loading...</div>;
  }

  return (
    <div className='text-white text-center '>
      <FileUpload useremail={session.user.email} />
    </div>
  );
};

export default Dashboard;