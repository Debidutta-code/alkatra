import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/flight-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/flight-ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/flight-ui/select";
import { Input } from "@/components/ui/flight-ui/input";
import { Label } from "@/components/ui/flight-ui/label";
import { useFlightOffersStore } from "../context/flight-offers-provider";
import { FormState, Traveler } from "@/store";

const TravelerInfoModal = ({
  selectedTraveler,
  setOpenTravelerInfoModal,
  openTravelerInfoModal,
  form,
  setForm,
}: {
  selectedTraveler: any;
  setOpenTravelerInfoModal: React.Dispatch<React.SetStateAction<boolean>>;
  openTravelerInfoModal: boolean;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const { travelers, setTravelers , selectedFlight } = useFlightOffersStore((state) => state);
  const [travelerForm, setTravelerForm] = useState<FormState>({} as FormState)

  const handleTravelerInfo = (info: FormState) => {
    console.log("info before creating object" , info)
    const traveler: Traveler = {
      id: selectedTraveler.travelerId || "",
      dateOfBirth: info.dob,
      gender: info.gender as "MALE" | "FEMALE" | "OTHER",
      name: {
        firstName: info.firstName,
        lastName: info.lastName,
      },
      // Conditionally include contact only if travelerType is not "ADULT"
      ...(selectedTraveler.travelerType === "ADULT"
        ? {
            contact: {
              emailAddress: info.email,
              phones: [
                {
                  deviceType: "MOBILE",
                  countryCallingCode: "91",
                  number: info.phone,
                },
              ],
            },
          }
        : {}),
    };

    console.log("info after creating object" , info)
    console.log("traveler" , traveler , selectedTraveler.travelerType)
    // Check if the traveler with the same email or phone number already exists
    const isExistingTraveler = travelers.some(
      (traveler) =>{
        if(info.email || info.phone){

         return traveler?.contact?.emailAddress === info?.email ||
          traveler?.contact?.phones.some((phone) => phone.number === info?.phone)
        }
      }
    );

    // Only add the traveler if they are not already in the array
    if (!isExistingTraveler) {
      const newTravelers = [...travelers, traveler];
      setTravelers(newTravelers);
      
    } else {
      console.log("Traveler with this email or phone number already exists");
    }
    console.log("info====>",info , "travelers from travelerinfo" , travelers)
    setTravelerForm({} as FormState)
  };

  useEffect(() => {
    console.log("t array %%%%%%%%%%%", travelers);
  }, [travelers]);

  return (
    <div>
      <Dialog
        open={openTravelerInfoModal}
        onOpenChange={setOpenTravelerInfoModal}
      >
        <DialogContent className="sm:max-w-[425px] h-[100%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTraveler.name?.firstName ? selectedTraveler.name?.firstName : selectedTraveler.travelerType}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="md:text-right">
                First name
              </Label>
              <Input
                id="firstName"
                className="col-span-3"
                value={travelerForm?.firstName || selectedTraveler?.name?.firstName}
                onChange={(e) =>
                  setTravelerForm({ ...travelerForm, firstName: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="md:text-right">
                Last name
              </Label>
              <Input
                id="lastName"
                className="col-span-3"
                value={travelerForm?.lastName || selectedTraveler?.name?.lastName}
                onChange={(e) => setTravelerForm({ ...travelerForm, lastName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="md:text-right">
                Gender
              </Label>
              <Select
              value={travelerForm.gender || selectedTraveler?.gender}
                onValueChange={(value) => setTravelerForm({ ...travelerForm, gender: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dob" className="md:text-right">
                Date of birth
              </Label>
              <Input
                id="dob"
                type="date"
                className="col-span-3"
                value={travelerForm?.dob}
                onChange={(e) => setTravelerForm({ ...travelerForm, dob: e.target.value })}
              />
            </div>
            {selectedTraveler.travelerType === "ADULT" ?
             <div className="flex flex-col gap-2 mt-4">
             <h3 className="font-semibold">Contact details</h3>
             <div className="space-y-4">
               <div className="space-y-1">
                 <Label htmlFor="email">Contact email*</Label>
                 <Input
                   id="email"
                   placeholder="We'll send your flight confirmation here"
                   value={travelerForm?.email}
                   onChange={(e) =>
                     setTravelerForm({ ...travelerForm, email: e.target.value })
                   }
                 />
               </div>
               <div className="space-y-1">
                 <Label htmlFor="phone">Phone number *</Label>
                 <div className="flex">
                   <select className="w-20 border rounded-l-md">
                     <option value="+91">+91</option>
                   </select>
                   <Input
                     id="phone"
                     className="rounded-l-none"
                     value={travelerForm?.phone}
                     onChange={(e) =>
                       setTravelerForm({ ...travelerForm, phone: e.target.value })
                     }
                   />
                 </div>
               </div>
             </div>
           </div>
             : null}
           
          </div>
          <Button
            onClick={() => {
              handleTravelerInfo(travelerForm);
              setOpenTravelerInfoModal(false);
            }}
            className="w-full"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelerInfoModal;
