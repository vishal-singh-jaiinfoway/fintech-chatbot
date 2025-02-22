"use client"

// pages/index.tsx
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import Head from "next/head";

import { Provider } from 'react-redux';
import { store } from '@/store/store';

import gopherChat from './../public/gopher.json'
const Home = () => {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogin = () => {
    if (password === "genai@123") {
      setIsLoggedIn(true);
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <Provider store={store}>
      <div className="flex h-screen">
        <Head>
          <title>Financial Recommendation System</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {isLoggedIn ? (
          <>
            <Sidebar />
            <MainContent />
          </>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <h2 className="text-2xl font-bold mb-4">Login</h2>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
              />
              <button
                onClick={handleLogin}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </Provider>
  );
};

export default Home;

