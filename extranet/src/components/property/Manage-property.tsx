'use client'
import React, { useState, useEffect } from "react";
import {
  Card as NextUICard,
  CardFooter as NextUICardFooter,
  Button as NextUIButton,
  Tooltip,
} from "@nextui-org/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PropertySlide from "../../components/property/property-slide";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

const Home: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [draftProperties, setDraftProperties] = useState<any[]>([]);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    const fetchProperties = async (accessToken: string) => {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/me`, {
          headers: {
            Authorization: "Bearer " + accessToken,
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
    <main className="py-8 px-8">
      <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <CardHeader>
          <CardTitle className="text-neutral-900 dark:text-neutral-100">My Properties</CardTitle>
          <CardDescription className="text-neutral-600 dark:text-neutral-400">
            Manage your properties
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          <div className="w-full overflow-x-auto flex gap-4 relative">
            <PropertySlide properties={draftProperties} />
          </div>
          <div className="flex items-center">
            <Tooltip content="View More">
              <Link href={`/app/property`}>
                <NextUIButton 
                  isIconOnly 
                  variant="ghost" 
                  className="rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  <ChevronRight size={28} />
                </NextUIButton>
              </Link>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Home;