'use client'

import React, { useEffect, useState } from "react";
import PropertySlide from "../../../../components/property/property-slide";
import Cookies from "js-cookie";
import axios from "axios";

export default function Property() {
  const [properties, setProperties] = useState([]);
  const [draftProperties, setDraftProperties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        const { data } = await axios.get("http://localhost:8040/api/v1/property/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setProperties(data.data.properties);
        setDraftProperties(data.data.draftProperties);
      } catch (error) {
        console.error("Failed to fetch properties", error);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="py-8 px-56">
      <div className="mt-10 flex flex-wrap gap-4">
        <PropertySlide properties={draftProperties} />
      </div>
    </main>
  );
}