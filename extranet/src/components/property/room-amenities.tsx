"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./../ui/card";
import { Label } from "./../ui/label";
import { Button } from "./../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./../ui/select";

import { Checkbox } from "./../ui/checkbox";
import axios from "axios";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./../ui/accordion";
import { ScrollArea } from "./../ui/scrollarea";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

const BedType = z.enum(["single", "double", "king", "twin", "queen"]);

const roomSchema = z.object({
  // Basic Room Amenities
  bed: BedType,
  bathroom: z.boolean(),
  linensBedding: z.boolean(),
  linens: z.boolean(),
  bidet: z.boolean(),
  toiletPaper: z.boolean(),
  towelsSheets: z.boolean(),
  freeToiletries: z.boolean(),
  shower: z.boolean(),
  toilet: z.boolean(),

  // Furniture Amenities
  tableChairs: z.boolean(),
  desk: z.boolean(),
  dresserWardrobe: z.boolean(),
  sofaSeating: z.boolean(),
  diningTable: z.boolean(),
  readingChair: z.boolean(),

  // Space Layout
  diningArea: z.boolean(),
  sittingArea: z.boolean(),
  balcony: z.boolean(),

  // Technology Amenities
  television: z.boolean(),
  telephone: z.boolean(),
  wifiInternet: z.boolean(),
  flatScreenTV: z.boolean(),
  satelliteChannels: z.boolean(),
  cableChannels: z.boolean(),

  // Climate Control
  airConditioning: z.boolean(),
  heating: z.boolean(),

  // Kitchen/MiniBar Amenities
  smallRefrigerator: z.boolean(),
  microwave: z.boolean(),
  refrigerator: z.boolean(),
  kitchenware: z.boolean(),
  electricKettle: z.boolean(),
  oven: z.boolean(),
  stovetop: z.boolean(),
  teaCoffeeMaker: z.boolean(),

  // Safety/Security
  safe: z.boolean(),
  smokeDetectors: z.boolean(),
  fireExtinguisher: z.boolean(),

  // Toiletries
  shampooConditioner: z.boolean(),
  soap: z.boolean(),
  hairDryer: z.boolean(),

  // Work/Leisure
  workDesk: z.boolean(),
  additionalLighting: z.boolean(),
  ironingFacilities: z.boolean(),

  // Accessibility
  accessibleBathroom: z.boolean(),
  wheelchairAccessibility: z.boolean(),
  upperFloorsAccessibleByElevator: z.boolean(),
  entireUnitWheelchairAccessible: z.boolean(),
});

type Inputs = z.infer<typeof roomSchema> & {
  description: string;
};

type Props = {
  onPrevious: () => void;
  onNext: () => void;
};

export default function Rooms({ onNext, onPrevious }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [currenStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [roomDetails, setroomDetails] = useState<any>(null);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const property_id = useSearchParams().get("property_id");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/${property_id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const propertyRoom = response.data.data.property_room;
        if (Array.isArray(propertyRoom) && propertyRoom.length > 0) {
          setroomDetails(propertyRoom[0]);
        } else {
          setroomDetails(null);
        }
      } catch (error) {
        // Handle error
      }
    };
    if (property_id) fetchRoomDetails();
  }, [property_id, accessToken]);

  const form = useForm<Inputs>({
    defaultValues: {
      // Basic Room Amenities
      bed: "single",
      bathroom: false,
      linensBedding: false,
      linens: false,
      bidet: false,
      toiletPaper: false,
      towelsSheets: false,
      freeToiletries: false,
      shower: false,
      toilet: false,

      // Furniture Amenities
      tableChairs: false,
      desk: false,
      dresserWardrobe: false,
      sofaSeating: false,
      diningTable: false,
      readingChair: false,

      //Space Layout
      diningArea: false,
      sittingArea: false,
      balcony: false,

      // Technology Amenities
      television: false,
      telephone: false,
      wifiInternet: false,
      flatScreenTV: false,
      satelliteChannels: false,
      cableChannels: false,

      // Climate Control
      airConditioning: false,
      heating: false,

      // Kitchen/MiniBar Amenities
      smallRefrigerator: false,
      microwave: false,
      refrigerator: false,
      kitchenware: false,
      electricKettle: false,
      oven: false,
      stovetop: false,
      teaCoffeeMaker: false,

      // Safety/Security
      safe: false,
      smokeDetectors: false,
      fireExtinguisher: false,

      // Toiletries
      shampooConditioner: false,
      soap: false,
      hairDryer: false,

      // Work/Leisure
      workDesk: false,
      additionalLighting: false,
      ironingFacilities: false,

      // Accessibility
      accessibleBathroom: false,
      wheelchairAccessibility: false,
      upperFloorsAccessibleByElevator: false,
      entireUnitWheelchairAccessible: false,
    },
    resolver: zodResolver(roomSchema),
  });

  const { register, control, handleSubmit, setValue, formState, getValues } = form;

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const amenities = {
      basic: {
        bed: data.bed,
        bathroom: !!data.bathroom,
        linensBedding: !!data.linensBedding,
        linens: !!data.linens,
        bidet: !!data.bidet,
        toiletPaper: !!data.toiletPaper,
        towelsSheets: !!data.towelsSheets,
        freeToiletries: !!data.freeToiletries,
        shower: !!data.shower,
        toilet: !!data.toilet,
      },
      furniture: {
        tableChairs: !!data.tableChairs,
        desk: !!data.desk,
        dresserWardrobe: !!data.dresserWardrobe,
        sofaSeating: !!data.sofaSeating,
        diningTable: !!data.diningTable,
        readingChair: !!data.readingChair,
      },
      spaceLayout: {
        diningArea: !!data.diningArea,
        sittingArea: !!data.sittingArea,
        balcony: !!data.balcony,
      },
      technology: {
        television: !!data.television,
        telephone: !!data.telephone,
        wifiInternet: !!data.wifiInternet,
        flatScreenTV: !!data.flatScreenTV,
        satelliteChannels: !!data.satelliteChannels,
        cableChannels: !!data.cableChannels,
      },
      climateControl: {
        airConditioning: !!data.airConditioning,
        heating: !!data.heating,
      },
      kitchenetteMiniBar: {
        smallRefrigerator: !!data.smallRefrigerator,
        microwave: !!data.microwave,
        refrigerator: !!data.refrigerator,
        kitchenware: !!data.kitchenware,
        electricKettle: !!data.electricKettle,
        oven: !!data.oven,
        stovetop: !!data.stovetop,
        teaCoffeeMaker: !!data.teaCoffeeMaker,
      },
      safetySecurity: {
        safe: !!data.safe,
        smokeDetectors: !!data.smokeDetectors,
        fireExtinguisher: !!data.fireExtinguisher,
      },
      toiletries: {
        shampooConditioner: !!data.shampooConditioner,
        soap: !!data.soap,
        hairDryer: !!data.hairDryer,
      },
      workLeisure: {
        workDesk: !!data.workDesk,
        additionalLighting: !!data.additionalLighting,
        ironingFacilities: !!data.ironingFacilities,
      },
      accessibilityFeatures: {
        accessibleBathroom: !!data.accessibleBathroom,
        wheelchairAccessibility: !!data.wheelchairAccessibility,
        upperFloorsAccessibleByElevator: !!data.upperFloorsAccessibleByElevator,
        entireUnitWheelchairAccessible: !!data.entireUnitWheelchairAccessible,
      },
    };

    const roomBody = {
      ...data,
      propertyInfo_id: property_id,
      room_type: roomDetails.room_type,
      amenities,
    };

    setFormLoading(true);

    try {
      const {
        data: { data: newRoom },
      } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/amenite/roomaminity`,
        roomBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setFormLoading(false);
      toast.success("Room amenities submitted successfully!");
      onNext();
      router.push(`/app/property/propertyDetails/?propertyId=${property_id}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFormLoading(false);
        toast.error("Failed to submit room amenities");
      }
    }
  };

  // Helper function to create checkbox
  const createCheckbox = (id: string, label: string, value: any) => (
    <div className="flex items-center space-x-2 mb-2">
      <Checkbox
        id={id}
        checked={roomDetails?.[id] || false}
        {...register(id as any)}
        onCheckedChange={(checked: boolean) => {
          setroomDetails({ ...roomDetails, [id]: checked });
          setValue(id as any, checked);
        }}
      />
      <Label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
    </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <CardTitle>Room Amenities</CardTitle>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap">
            <ScrollArea className="h-72 w-full px-6">
              <Accordion type="multiple" className="w-full">

                {/* Basic Room Amenities */}
                <AccordionItem value="amenity-1">
                  <AccordionTrigger>Basic Room Amenities</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 items-start justify-between">
                    <div className="w-full">
                      <Label>Bed Type</Label>
                      <Select
                        value={roomDetails?.bed || ""}
                        onValueChange={(value: any) => {
                          setroomDetails({ ...roomDetails, bed: value });
                          setValue("bed", value as any);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bed type" />
                        </SelectTrigger>
                        <SelectContent>
                          {["single", "double", "king", "twin", "queen"]?.map(
                            (item, index) => (
                              <SelectItem key={`${item + index}`} value={item}>
                                {item.charAt(0).toUpperCase() + item.substring(1)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full">
                      <div className="flex flex-col space-y-2">
                        {createCheckbox("bathroom", "Bathroom", roomDetails?.bathroom)}
                        {createCheckbox("linensBedding", "Linens Bedding", roomDetails?.linensBedding)}
                        {createCheckbox("linens", "Linens", roomDetails?.linens)}
                        {createCheckbox("bidet", "Bidet", roomDetails?.bidet)}
                        {createCheckbox("toiletPaper", "Toilet Paper", roomDetails?.toiletPaper)}
                        {createCheckbox("towelsSheets", "Towels/Sheets (extra fee)", roomDetails?.towelsSheets)}
                        {createCheckbox("freeToiletries", "Free Toiletries", roomDetails?.freeToiletries)}
                        {createCheckbox("shower", "Shower", roomDetails?.shower)}
                        {createCheckbox("toilet", "Toilet", roomDetails?.toilet)}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Furniture Amenities */}
                <AccordionItem value="amenity-2">
                  <AccordionTrigger>Furniture Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {createCheckbox("tableChairs", "Table Chairs", roomDetails?.tableChairs)}
                      {createCheckbox("desk", "Desk", roomDetails?.desk)}
                      {createCheckbox("dresserWardrobe", "Dresser Wardrobe", roomDetails?.dresserWardrobe)}
                      {createCheckbox("sofaSeating", "Sofa Seating", roomDetails?.sofaSeating)}
                      {createCheckbox("diningTable", "Dining Table", roomDetails?.diningTable)}
                      {createCheckbox("readingChair", "Reading Chair", roomDetails?.readingChair)}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="amenity-3"> {/* Unique value */}
                  <AccordionTrigger>Space Layout</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {createCheckbox("diningArea", "Dining Area", roomDetails?.diningArea)}
                      {createCheckbox("sittingArea", "Sitting Area", roomDetails?.sittingArea)}
                      {createCheckbox("balcony", "Balcony", roomDetails?.balcony)}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Technology Amenities */}
                <AccordionItem value="amenity-4">
                  <AccordionTrigger>Technology Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {createCheckbox("television", "Television", roomDetails?.television)}
                      {createCheckbox("telephone", "Telephone", roomDetails?.telephone)}
                      {createCheckbox("wifiInternet", "Wifi Internet", roomDetails?.wifiInternet)}
                      {createCheckbox("flatScreenTV", "Flat-screen TV", roomDetails?.flatScreenTV)}
                      {createCheckbox("satelliteChannels", "Satellite Channels", roomDetails?.satelliteChannels)}
                      {createCheckbox("cableChannels", "Cable Channels", roomDetails?.cableChannels)}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Climate Control Amenities */}
                <AccordionItem value="amenity-5">
                  <AccordionTrigger>Climate Control Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {createCheckbox("airConditioning", "Air Conditioning", roomDetails?.airConditioning)}
                      {createCheckbox("heating", "Heating", roomDetails?.heating)}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Kitchen/MiniBar Amenities */}
                <AccordionItem value="amenity-6">
                  <AccordionTrigger>Kitchen/MiniBar Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {createCheckbox("smallRefrigerator", "Small Refrigerator", roomDetails?.smallRefrigerator)}
                      {createCheckbox("microwave", "Microwave", roomDetails?.microwave)}
                      {createCheckbox("refrigerator", "Refrigerator", roomDetails?.refrigerator)}
                      {createCheckbox("kitchenware", "Kitchenware", roomDetails?.kitchenware)}
                      {createCheckbox("electricKettle", "Electric Kettle", roomDetails?.electricKettle)}
                      {createCheckbox("oven", "Oven", roomDetails?.oven)}
                      {createCheckbox("stovetop", "Stovetop", roomDetails?.stovetop)}
                      {createCheckbox("teaCoffeeMaker", "Tea/Coffee Maker", roomDetails?.teaCoffeeMaker)}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Safety/Security Amenities */}
                <AccordionItem value="amenity-7">
                  <AccordionTrigger>Safety/Security Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {createCheckbox("safe", "Safe", roomDetails?.safe)}
                      {createCheckbox("smokeDetectors", "Smoke Detectors", roomDetails?.smokeDetectors)}
                      {createCheckbox("fireExtinguisher", "Fire Extinguisher", roomDetails?.fireExtinguisher)}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Toiletries Amenities */}
                <AccordionItem value="amenity-8">
                  <AccordionTrigger>Toiletries Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {createCheckbox("shampooConditioner", "Shampoo Conditioner", roomDetails?.shampooConditioner)}
                      {createCheckbox("soap", "Soap", roomDetails?.soap)}
                      {createCheckbox("hairDryer", "Hair Dryer", roomDetails?.hairDryer)}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Work/Leisure Amenities */}
                <AccordionItem value="amenity-9">
                  <AccordionTrigger>Work/Leisure Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {createCheckbox("workDesk", "Work Desk", roomDetails?.workDesk)}
                      {createCheckbox("additionalLighting", "Additional Lighting", roomDetails?.additionalLighting)}
                      {createCheckbox("ironingFacilities", "Ironing Facilities", roomDetails?.ironingFacilities)}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Accessibility Features */}
                <AccordionItem value="amenity-10">
                  <AccordionTrigger>Accessibility Features</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {createCheckbox("accessibleBathroom", "Accessible Bathroom", roomDetails?.accessibleBathroom)}
                      {createCheckbox("wheelchairAccessibility", "Wheelchair Accessibility", roomDetails?.wheelchairAccessibility)}
                      {createCheckbox("upperFloorsAccessibleByElevator", "Upper Floors Accessible by Elevator", roomDetails?.upperFloorsAccessibleByElevator)}
                      {createCheckbox("entireUnitWheelchairAccessible", "Entire Unit Wheelchair Accessible", roomDetails?.entireUnitWheelchairAccessible)}
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 w-full mt-4">
          <div className="mt-2">
            <Button
              className="lg:w-[180px] md:w-[120px] w-[100px] text-right"
              onClick={onPrevious}
              variant={"secondary"}
              type="button"
            >
              Back
            </Button>
          </div>
          <div className="mt-2">
            <Button
              className="lg:w-[180px] md:w-[120px] w-[100px]"
              type="submit"
              disabled={formLoading}
            >
              {formLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}