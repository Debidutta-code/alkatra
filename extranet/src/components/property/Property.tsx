"use client";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/ui/breadcrumbs";
import PropertySlide from "./property-slide";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RootState, useSelector, useDispatch, store } from "../../redux/store";
import { getProperties } from "../../redux/slices/propertySlice";
import { Spinner } from "@nextui-org/react";
import { AlertCircle } from "lucide-react";

type Props = {
  searchParams: {
    token: string;
  };
};

export default function Property({ searchParams }: Props) {
  const dispatch = useDispatch();
  const { draftProperties, allProperties, teamProperties, loading, error } =useSelector((state: RootState) => state.propertyReducer);
  const { user } = useSelector((state: RootState) => state.auth);
  const [displayedProperties, setDisplayedProperties] = useState<any[]>([]);
  const fetchProperty = async () => {
    await dispatch(getProperties());
  };
  useEffect(() => {
    fetchProperty();
  }, [dispatch]);
  const isDisabled = () => {
    const state = store.getState();
    const currentUser = state.auth.user;
    const isHotelManager=currentUser?.role == "hotelManager";
    const isPropertyExists=(currentUser?.noOfProperties ?? 0) > 0
    return  isHotelManager&&!isPropertyExists ;
  }
  // Update displayed properties based on user role
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "superAdmin":
          // Show all properties for superAdmin
          setDisplayedProperties(
            allProperties.length > 0 ? allProperties : draftProperties
          );
          break;
        case "groupManager":
          // Show team properties for groupManager
          setDisplayedProperties(
            teamProperties.length > 0 ? teamProperties : draftProperties
          );
          break;
        default:
          // Default case for hotelManager or any other role
          setDisplayedProperties(draftProperties);
      }
    } else {
      setDisplayedProperties(draftProperties);
    }
  }, [user, draftProperties, allProperties, teamProperties]);

  return (
    <div>
      <div className="flex items-center justify-center gap-4 mt-4">
        <Breadcrumbs />
        {(isDisabled()) && (
        <Button
          variant="outline"
          className="flex justify-center items-center space-x-2"
        >
            <Link href="/app/property/create" className="flex items-center">
              <Plus size={16} strokeWidth={2.5} className="mr-2" />
              <span>Create</span>
            </Link>
        </Button>
          ) }

      </div>{" "}
      {error && (
        <div className="mx-8 mt-4 p-4 border border-red-200 rounded bg-red-50 text-red-800">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      <div className="mt-10 flex flex-wrap gap-4 p-8 m-8 justify-center">
        {loading ? (
          <div className="flex justify-center items-center w-full">
            <Spinner size="lg" color="primary" />
          </div>
        ) : displayedProperties?.length > 0 ? (
          <PropertySlide properties={displayedProperties} />
        ) : (
          <div className="text-center text-gray-500">
          </div>
        )}
      </div>
    </div>
  );
}