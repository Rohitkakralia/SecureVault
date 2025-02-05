"use client"
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import {useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="text-white shadow-md w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">Secure Vault</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-slate-100 hover:text-slate-300">
              Catalog
            </a>
            <a href="#" className="text-slate-100 hover:text-slate-300">
              Delivery
            </a>
            <a href="#" className="text-slate-100 hover:text-slate-300">
              Payment
            </a>
            <a href="#" className="text-slate-100 hover:text-slate-300">
              Contact
            </a>
            <a href="#" className="text-slate-100 hover:text-slate-300">
              About us
            </a>
          </div>

          {/* Buttons */}
          {!session && <div className="hidden md:flex space-x-4 mt-2 items-center">
          <button type="button" className="text-gray-900 h-12 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">Sign Up</button>
            <Link href="/login" className="text-white h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Log In</Link>
          </div>}
          {session && <div className="hidden md:flex space-x-4 mt-2 items-center">
            <Link href="/login" onClick={() => { signOut() }}  className="text-white h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Log out</Link>
          </div>}

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md absolute top-16 left-0 right-0 p-4">
          <a href="#" className="block py-2 text-gray-700">
            Catalog
          </a>
          <a href="#" className="block py-2 text-gray-700">
            Delivery
          </a>
          <a href="#" className="block py-2 text-gray-700">
            Payment
          </a>
          <a href="#" className="block py-2 text-gray-700">
            Contact
          </a>
          <a href="#" className="block py-2 text-gray-700">
            About us
          </a>
          <button className="w-full py-2 border border-gray-700 rounded-md my-2">
            Sign In
          </button>
           <button type="button" className="text-white h-12 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Cyan to Blue</button>
        </div>
      )}
    </nav>
  );
}
