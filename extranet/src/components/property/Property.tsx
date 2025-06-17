'use client'
import React, { useEffect } from "react";
import Breadcrumbs from "../../components/ui/breadcrumbs";
import PropertySlide from "./property-slide";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RootState, store, useSelector , useDispatch } from "../../redux/store";
import axios from "axios";
import { cookies } from 'next/headers'
import { getProperties } from "../../redux/slices/propertySlice";

type Props = {
    searchParams: {
      token: string;
    };
  };

export default function Property({ searchParams }: Props) {
    const dispatch = useDispatch();
    const { draftProperties } = useSelector((state: RootState) => state.propertyReducer);

    useEffect(() => {
        const fetchProperty = async ()=>{
            await dispatch(getProperties());
        }
        fetchProperty();
    }, [])
    

  return (
    // <main className="py-8 px-56">
    <div>
      {/* <div className="flex items-center justify-between"> */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <Breadcrumbs />
        <Link href={"/app/property/create"}>
          <Button variant={"outline"}>
            <Plus size={16} strokeWidth={2.5} className="mr-2" />
            Create
          </Button>
        </Link>
      </div>
      <div className="mt-10 flex flex-wrap gap-4 p-8 m-8 justify-center">
        <PropertySlide properties={draftProperties} />
      </div>
      </div>
    // </main>
  );
}