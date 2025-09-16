'use client'
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import Analytics from "../analytics/Analytics";

const Home: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [draftProperties, setDraftProperties] = useState<any[]>([]);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const userRole = useSelector((state: RootState) => state.auth.user?.role);
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
      return;
    }
    const fetchProperties = async (accessToken: string) => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const { properties, draftProperties } = data.data;
        setProperties(properties);
        setDraftProperties(draftProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
        toast.error("Something went wrong");
      }
    };

    if (!accessToken) {
      console.log("Access token not found in cookies");
    } else {
      fetchProperties(accessToken);
    }
  }, [accessToken]);

  return (
    <main className="min-h-screen bg-tripswift-off-white dark:bg-tripswift-black">
      <Analytics />
    </main>
  );
};

export default Home;