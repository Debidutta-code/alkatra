"use client";

import React, { useEffect, useState } from "react";
import { CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { RootState, useSelector } from "../../../redux/store";
import Cookies from "js-cookie";


type Props = {
  data: Data;
};

type Data = {
  firstname: string;
  lastname: string;
  email: string;
};
const accessTokenFromCookie = Cookies.get("accessToken");

const updateProfileSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
});

// const fetchUserData = async () => {
//   try {
//     const response = await axios.get("http://localhost:8020/api/v1/user/me", {
//       headers: {
//         Authorization: `Bearer ${accessTokenFromCookie}`,
//       },
//     });

//     console.log("New User data :", response.data.data.user._id);
//     return {
//       userId: response.data.data.user._id,
//       Updated_userdata: response.data.data.user,
//     };
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     throw error;
//   }
// };

export default function ProfileForm({ data }: Props) {
  const [isEditable, setIsEditable] = useState(false);

  const { accessToken, user } = useSelector(
    (state: RootState) => state.auth
  );
   console.log("Profile Info from ProfileFrom", user);
   console.log("Token ", accessToken);

  
  const form = useForm<Data>({
    defaultValues: {
      firstname: user?.firstName,
      lastname: user?.lastName,
      email: user?.email,
    },
    resolver: zodResolver(updateProfileSchema),
  });


  
  const { register, control, handleSubmit, formState } = form;

  const {
    errors: {
      firstname: firstnameError,
      lastname: lastnameError,
      email: emailError,
    },
  } = formState;

  useEffect(() => {
    firstnameError && toast.error(firstnameError.message!);
    lastnameError && toast.error(lastnameError.message!);
    emailError && toast.error(emailError.message!);
  }, [emailError, firstnameError, lastnameError]);

  const onSubmit: SubmitHandler<Data> = async (data) => {
    // try {
    //   console.log('data from form' , data , user)

    //   const requestData = {
    //      userId: user?._id,
    //     ...data,
    //   };

    //   const response = await axios.patch(
    //     "http://localhost:8020/api/v1/user/update",
    //     requestData,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${accessToken}`,
    //       },
    //     }
    //   );
    //   console.log("Requestdata", requestData);

    //   console.log("update data", data);

    //   console.log("Update Profile response", response.data.data.user);

    //   // toast.success("Profile updated successfully");
    // } catch (error) {
    //   console.error("Error updating profile:", error);
    //   toast.error("Failed to update profile");
    // }
  };
  
  // useEffect(() => {
  //   const fetchData = async () => {
  //     await fetchUserData();
  //   };
  //   fetchData();
  // }, []);

  const handleEditClick = () => {
    setIsEditable(true);
    toast.success("Edit mode enabled");
  };

  const handleCancelClick = () => {
    setIsEditable(false);
    toast.success("Edit mode canceled");
  };
  const handleupdateClick = () => {
    setIsEditable(false);
    toast.success("Profile updated successfully");
  };

  return (
    <div className="px-4 items-center justify-center">
      <CardTitle className="mb-4">Profile</CardTitle>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <Label htmlFor="firstname">Firstname</Label>
          <Input
            variant={"default"}
            type="text"
            className="w-[300px]"
            placeholder="Firstname"
            {...register("firstname")}
            id="firstname"
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label htmlFor="lastname">Lastname</Label>
          <Input
            placeholder="Lastname"
            type="text"
            id="lastname"
            {...register("lastname")}
            disabled={!isEditable}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            placeholder="Email"
            type="email"
            id="email"
            {...register("email")}
            disabled={!isEditable}
          />
        </div>
        {/* <div className="flex items-center gap-2 justify-end mt-4">
          <Toggle onClick={() => setIsEditable((prev) => !prev)}>
            <PenLine size={16} />
          </Toggle>
          <Button type="submit">Update Profile</Button>
        </div> */}
        <div className="flex items-center justify-between mt-4">
          {!isEditable ? (
            <button
              onClick={handleEditClick}
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleCancelClick}
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            onClick={handleupdateClick}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
}
