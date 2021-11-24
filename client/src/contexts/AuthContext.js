import React, { createContext, useState, useEffect } from "react";
import { setCookie, parseCookies } from "nookies";
import { signInRequest, recoverUserInformation } from "../services/auth";
import Router from "next/router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "@firebase/auth";

import { auth } from "../lib/firebase";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    const { "mls.token": token } = parseCookies();

    if (token) {
       recoverUserInformation().then(response=> {
         setUser(response.user)
       })
    }
  }, []);

  async function signIn({ email, password }) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    console.debug(user);

    if (!!user?.accessToken) {
      setCookie(undefined, "mls.token", user.accessToken, {
        maxAge: 60 * 60 * 14, // 1 hour
      });

      // setCookie(undefined,'mls.user',user,{
      //   maxAge:60*60*14,// 1 hour
      // })

      //api.defaults.headers['Authorization'] = `Bearer ${user.token}`;

      setUser(user);

      Router.push("/");
    } else {
      alert("Usuário ou senha inválidos");
    }
  }

  //Authentication functions
  async function signUp(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
  }

  async function resetPassword(email) {
    return await sendPasswordResetEmail(auth, email);
  }

  async function logout() {
    return await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        signIn,
        signUp,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
