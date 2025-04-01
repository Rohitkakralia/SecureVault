// app/components/NavbarWrapper.jsx
'use client'
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import LoginNavbar from "./LoginNavbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  
  if (isLoginPage) {
    return <LoginNavbar />;
  }
  
  return <Navbar />;
}