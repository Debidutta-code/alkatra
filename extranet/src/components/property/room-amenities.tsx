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
  // name: z.string().min(1, { message: "Room name is required" }),
  // type: z.string().min(1, { message: "Room type is required" }),
  bed: BedType,
  bathroom: z.boolean(),
  towels: z.boolean(),
  linensBedding: z.boolean(),
  tableChairs: z.boolean(),
  desk: z.boolean(),
  dresserWardrobe: z.boolean(),
  sofaSeating: z.boolean(),
  television: z.boolean(),
  telephone: z.boolean(),
  wifiInternet: z.boolean(),
  airConditioning: z.boolean(),
  heating: z.boolean(),
  smallRefrigerator: z.boolean(),
  microwave: z.boolean(),
  coffeeMaker: z.boolean(),
  cctv: z.boolean(),
  smokeDetectors: z.boolean(),
  fireExtinguisher: z.boolean(),
  shampooConditioner: z.boolean(),
  soap: z.boolean(),
  hairdryer: z.boolean(),
  workDesk: z.boolean(),
  readingChair: z.boolean(),
  additionalLighting: z.boolean(),
  accessibleBathroom: z.boolean(),
  wheelchairAccessibility: z.boolean(),
});

type Inputs = {
  // name: string;
  // type: string;
  bed: "single" | "double" | "king" | "twin" | "queen";
  bathroom: boolean;
  towels: boolean;
  linensBedding: boolean;
  tableChairs: boolean;
  desk: boolean;
  dresserWardrobe: boolean;
  sofaSeating: boolean;
  television: boolean;
  telephone: boolean;
  wifiInternet: boolean;
  airConditioning: boolean;
  heating: boolean;
  smallRefrigerator: boolean;
  microwave: boolean;
  coffeeMaker: boolean;
  cctv: boolean;
  smokeDetectors: boolean;
  fireExtinguisher: boolean;
  shampooConditioner: boolean;
  soap: boolean;
  hairdryer: boolean;
  workDesk: boolean;
  readingChair: boolean;
  additionalLighting: boolean;
  accessibleBathroom: boolean;
  wheelchairAccessibility: boolean;
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
  // const { accessToken } = useSelector((state: RootState) => state.auth);
  // const accessToken = Cookies.get("accessToken");
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  console.log("Token from room aminities tsx", accessToken);

  const property_id = useSearchParams().get("property_id");
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm<Inputs>({
    defaultValues: {
      // name: "",
      // type: "",
      bed: "single",
      bathroom: false,
      towels: false,
      linensBedding: false,
      tableChairs: false,
      desk: false,
      dresserWardrobe: false,
      sofaSeating: false,
      television: false,
      telephone: false,
      wifiInternet: false,
      airConditioning: false,
      heating: false,
      smallRefrigerator: false,
      microwave: false,
      coffeeMaker: false,
      cctv: false,
      smokeDetectors: false,
      fireExtinguisher: false,
      shampooConditioner: false,
      soap: false,
      hairdryer: false,
      workDesk: false,
      readingChair: false,
      additionalLighting: false,
      accessibleBathroom: false,
      wheelchairAccessibility: false,
    },
    resolver: zodResolver(roomSchema),
  });

  const { register, control, handleSubmit, setValue, formState, getValues } =
    form;

  useEffect(() => {
    console.log({ errors: formState.errors });
  }, [formState.errors]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const amenities = {
      accessibilityFeatures: {
        accessibleBathroom: !!data.accessibleBathroom,
        wheelchairAccessibility: !!data.wheelchairAccessibility,
      },
      basic: {
        bed: data.bed,
        bathroom: !!data.bathroom,
        towels: !!data.towels,
        linensBedding: !!data.linensBedding,
      },
      climateControl: {
        airConditioning: !!data.airConditioning,
        heating: !!data.heating,
      },
      furniture: {
        tableChairs: !!data.tableChairs,
        desk: !!data.desk,
        dresserWardrobe: !!data.dresserWardrobe,
        sofaSeating: !!data.sofaSeating,
      },
      kitchenetteMiniBar: {
        smallRefrigerator: !!data.smallRefrigerator,
        microwave: !!data.microwave,
        coffeeMaker: !!data.coffeeMaker,
      },
      safetySecurity: {
        // cctv: !!data.cctv,
        smokeDetectors: !!data.smokeDetectors,
        fireExtinguisher: !!data.fireExtinguisher,
      },
      technology: {
        television: !!data.television,
        telephone: !!data.telephone,
        wifiInternet: !!data.wifiInternet,
      },
      toiletries: {
        shampooConditioner: !!data.shampooConditioner,
        soap: !!data.soap,
        hairdryer: !!data.hairdryer,
      },

      workLeisure: {
        workDesk: !!data.workDesk,
        readingChair: !!data.readingChair,
        additionalLighting: !!data.additionalLighting,
      },
    };

    const roomBody = {
      ...data,
      propertyInfo_id: property_id,
      // property_id:property_id
      amenities,
    };
    setFormLoading(true);

    console.log("onSubmit data:", data);
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

      console.log("NewRoom Data:", newRoom);
      setFormLoading(false);

      toast.success("Room amenities submitted successfully!");
      onNext();

      router.push("/app/property/single");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setFormLoading(false);
        toast.error(err?.response?.data?.message);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <CardTitle>Room Amenities</CardTitle>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 flex-wrap ">
            <ScrollArea className="h-72 w-full px-6">
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="amenity-1">
                  <AccordionTrigger>Room Amenities</AccordionTrigger>
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
                                {item.charAt(0).toUpperCase() +
                                  item.substring(1)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-full">
                      <div className="flex flex-col space-y-2">
                        {" "}
                        {/* Bathroom */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="bathroom"
                            checked={roomDetails?.bathroom}
                            {...register("bathroom")}
                            onCheckedChange={(value: boolean) => {
                              setroomDetails({
                                ...roomDetails,
                                bathroom: value,
                              });
                              setValue("bathroom", value as any);
                            }}
                          />
                          <label
                            htmlFor="bathroom"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Bathroom
                          </label>
                        </div>
                        {/* Towels */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="towels"
                            checked={roomDetails?.towels}
                            {...register("towels")}
                            onCheckedChange={(value: boolean) => {
                              setroomDetails({ ...roomDetails, towels: value });
                              setValue("towels", value as any);
                            }}
                          />
                          <label
                            htmlFor="towels"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Towels
                          </label>
                        </div>
                        {/* Linens Bedding */}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="linensBedding"
                            checked={roomDetails?.linensBedding}
                            {...register("linensBedding")}
                            onCheckedChange={(value: boolean) => {
                              setroomDetails({
                                ...roomDetails,
                                linensBedding: value,
                              });
                              setValue("linensBedding", value);
                            }}
                          />
                          <label
                            htmlFor="linensBedding"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Linens Bedding
                          </label>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="amenity-2">
                  <AccordionTrigger>Furniture Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="tableChairs"
                          checked={roomDetails?.tableChairs}
                          {...register("tableChairs")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              tableChairs: value,
                            });
                            setValue("tableChairs", value);
                          }}
                        />
                        <Label
                          htmlFor="tableChairs"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Table Chairs
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="desk"
                          checked={roomDetails?.desk}
                          {...register("desk")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({ ...roomDetails, desk: value });
                            setValue("desk", value);
                          }}
                        />
                        <Label
                          htmlFor="desk"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Desk
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="dresserWardrobe"
                          checked={roomDetails?.dresserWardrobe}
                          {...register("dresserWardrobe")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              dresserWardrobe: value,
                            });
                            setValue("dresserWardrobe", value);
                          }}
                        />
                        <Label
                          htmlFor="dresserWardrobe"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Dresser Wardrobe
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sofaSeating"
                          checked={roomDetails?.sofaSeating}
                          {...register("sofaSeating")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              sofaSeating: value,
                            });
                            setValue("sofaSeating", value);
                          }}
                        />
                        <Label
                          htmlFor="sofaSeating"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Sofa Seating
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="amenity-3">
                  <AccordionTrigger>Technology Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="television"
                          checked={roomDetails?.television}
                          {...register("television")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              television: value,
                            });
                            setValue("television", value);
                          }}
                        />
                        <Label
                          htmlFor="television"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Television
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="telephone"
                          checked={roomDetails?.telephone}
                          {...register("telephone")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              telephone: value,
                            });
                            setValue("telephone", value);
                          }}
                        />
                        <Label
                          htmlFor="telephone"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Telephone
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="wifiInternet"
                          checked={roomDetails?.wifiInternet}
                          {...register("wifiInternet")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              wifiInternet: value,
                            });
                            setValue("wifiInternet", value);
                          }}
                        />
                        <Label
                          htmlFor="wifiInternet"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Wifi Internet
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="amenity-4">
                  <AccordionTrigger>Climate Control Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="airConditioning"
                          checked={roomDetails?.airConditioning}
                          {...register("airConditioning")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              airConditioning: value,
                            });
                            setValue("airConditioning", value);
                          }}
                        />
                        <Label
                          htmlFor="airConditioning"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Air Conditioning
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="heating"
                          checked={roomDetails?.heating}
                          {...register("heating")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({ ...roomDetails, heating: value });
                            setValue("heating", value);
                          }}
                        />
                        <Label
                          htmlFor="heating"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Heating
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="amenity-5">
                  <AccordionTrigger>
                    Kitchenette MiniBar Amenities
                  </AccordionTrigger>
                  <AccordionContent>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="smallRefrigerator"
                          checked={roomDetails?.smallRefrigerator}
                          {...register("smallRefrigerator")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              smallRefrigerator: value,
                            });
                            setValue("smallRefrigerator", value);
                          }}
                        />
                        <Label
                          htmlFor="smallRefrigerator"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Small Refrigerator
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="microwave"
                          checked={roomDetails?.microwave}
                          {...register("microwave")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              microwave: value,
                            });
                            setValue("microwave", value);
                          }}
                        />
                        <Label
                          htmlFor="microwave"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Microwave
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="coffeeMaker"
                          checked={roomDetails?.coffeeMaker}
                          {...register("coffeeMaker")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              coffeeMaker: value,
                            });
                            setValue("coffeeMaker", value);
                          }}
                        />
                        <Label
                          htmlFor="coffeeMaker"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Coffee Maker
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="amenity-6">
                  <AccordionTrigger>Security Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      {/* <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="cctv"
                          checked={roomDetails?.cctv}
                          {...register("cctv")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({ ...roomDetails, cctv: value });
                            setValue("cctv", value);
                          }}
                        />
                        <Label
                          htmlFor="cctv"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          CCTV
                        </Label>
                      </div> */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="smokeDetectors"
                          checked={roomDetails?.smokeDetectors}
                          {...register("smokeDetectors")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              smokeDetectors: value,
                            });
                            setValue("smokeDetectors", value);
                          }}
                        />
                        <Label
                          htmlFor="smokeDetectors"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Smoke Detectors
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="fireExtinguisher"
                          checked={roomDetails?.fireExtinguisher}
                          {...register("fireExtinguisher")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              fireExtinguisher: value,
                            });
                            setValue("fireExtinguisher", value);
                          }}
                        />
                        <Label
                          htmlFor="fireExtinguisher"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Fire Extinguisher
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="amenity-7">
                  <AccordionTrigger>Toiletries Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="shampooConditioner"
                          checked={roomDetails?.shampooConditioner}
                          {...register("shampooConditioner")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              shampooConditioner: value,
                            });
                            setValue("shampooConditioner", value);
                          }}
                        />
                        <Label
                          htmlFor="shampooConditioner"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Shampoo Conditioner
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="soap"
                          checked={roomDetails?.soap}
                          {...register("soap")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({ ...roomDetails, soap: value });
                            setValue("soap", value);
                          }}
                        />
                        <Label
                          htmlFor="soap"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Soap
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hairdryer"
                          checked={roomDetails?.hairdryer}
                          {...register("hairdryer")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              hairdryer: value,
                            });
                            setValue("hairdryer", value);
                          }}
                        />
                        <Label
                          htmlFor="hairdryer"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Hair Dryer
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="amenity-9">
                  <AccordionTrigger>Work Leisure Amenities</AccordionTrigger>
                  <AccordionContent>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="workDesk"
                          checked={roomDetails?.workDesk}
                          {...register("workDesk")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({ ...roomDetails, workDesk: value });
                            setValue("workDesk", value);
                          }}
                        />
                        <Label
                          htmlFor="workDesk"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Work Desk
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="readingChair"
                          checked={roomDetails?.readingChair}
                          {...register("readingChair")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              readingChair: value,
                            });
                            setValue("readingChair", value);
                          }}
                        />
                        <Label
                          htmlFor="readingChair"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Reading Chair
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="additionalLighting"
                          checked={roomDetails?.additionalLighting}
                          {...register("additionalLighting")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              additionalLighting: value,
                            });
                            setValue("additionalLighting", value);
                          }}
                        />
                        <Label
                          htmlFor="additionalLighting"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Additional Lighting
                        </Label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="amenity-10">
                  <AccordionTrigger>
                    Accessibility Features Amenities
                  </AccordionTrigger>
                  <AccordionContent>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="accessibleBathroom"
                          checked={roomDetails?.accessibleBathroom}
                          {...register("accessibleBathroom")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              accessibleBathroom: value,
                            });
                            setValue("accessibleBathroom", value);
                          }}
                        />
                        <Label
                          htmlFor="accessibleBathroom"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Accessible Bathroom
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          id="wheelchairAccessibility"
                          checked={roomDetails?.wheelchairAccessibility}
                          {...register("wheelchairAccessibility")}
                          onCheckedChange={(value: boolean) => {
                            setroomDetails({
                              ...roomDetails,
                              wheelchairAccessibility: value,
                            });
                            setValue("wheelchairAccessibility", value);
                          }}
                        />
                        <Label
                          htmlFor="wheelchairAccessibility"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Wheelchair Accessibility
                        </Label>
                      </div>
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
            >
              Submit
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
