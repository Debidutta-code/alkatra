import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { PenTool, Plus, X, Save } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";

export const globalRoomMappings = {
  roomNameToId: {} as Record<string, string>,
  roomIdToName: {} as Record<string, string>,
};

// Define types for our component
interface RoomType {
  _id: string;
  room_name: string;
  rateplan_created?: boolean;
}

interface RatePlanType {
  _id: string;
  property_id: string;
  applicable_room_type: string;
  applicable_room_name: string;
  meal_plan: string;
  room_price: number;
  rate_plan_name: string;
  rate_plan_description: string;
  min_length_stay: number;
  max_length_stay: number;
  min_book_advance: number;
  max_book_advance: number;
}

interface RatePlanProps {
  ratePlanList: RatePlanType[];
  rooms: RoomType[];
  // ratePlan: RatePlanType | [];
  setRatePlan: React.Dispatch<React.SetStateAction<RatePlanType | []>>;
    setRatePlanList: React.Dispatch<React.SetStateAction<RatePlanType[]>>;
  property_id: string;
  accessToken: string;
}

// Zod schema for form validation
const ratePlanSchema = z.object({
  applicable_room_type: z.string().min(1, "Room type is required *"),
  applicable_room_name: z.string().min(1, "Room name is required *"),
  meal_plan: z.string().min(1, "Meal plan is required *"),
  room_price: z.number().min(0, "Price must be a positive number *"),
  rate_plan_name: z.string().min(1, "Rate plan name is required *"),
  rate_plan_description: z.string().optional(),
  min_length_stay: z
    .number()
    .min(0, "Minimum stay must be a positive number *"),
  max_length_stay: z.number().optional(),
  min_book_advance: z
    .number()
    .min(0, "Minimum advance booking must be a positive number *"),
  max_book_advance: z.number().optional(),
});

type FormValues = z.infer<typeof ratePlanSchema>;

// Helper function to convert object to array if needed
const convertObjectOfObjectsToArray = (obj: any) => {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  return typeof obj === "object" ? Object.values(obj) : [];
};

// Helper function to validate if a room object is valid
const isValidRoom = (room: any): room is RoomType => {
  return (
    room &&
    typeof room === "object" &&
    room._id &&
    typeof room._id === "string" &&
    room.room_name &&
    typeof room.room_name === "string"
  );
};

export function RatePlan({
  ratePlanList,
  rooms,
  // ratePlan,
  setRatePlan,
  property_id,
  accessToken,
  setRatePlanList
}: RatePlanProps) {
  // State management
  
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlanType | null>(
    null
  );
  const [ratePlanId, setRatePlanId] = useState<string | null>(null);

  // Make sure rooms is always an array
  const safeRooms = Array.isArray(rooms) ? rooms : [];
console.log("rate plan list",ratePlanList);
  // Get array of rooms safely
  const arrayOfRooms =
    safeRooms.length > 0
      ? safeRooms[0] && typeof safeRooms[0] === "object"
        ? convertObjectOfObjectsToArray(safeRooms[0])
        : convertObjectOfObjectsToArray(safeRooms)
      : [];

  // Filter out invalid room objects to prevent errors
  const validRooms = useMemo(() => {
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    const arrayOfRooms =
      safeRooms.length > 0
        ? safeRooms[0] && typeof safeRooms[0] === "object"
          ? convertObjectOfObjectsToArray(safeRooms[0])
          : convertObjectOfObjectsToArray(safeRooms)
        : [];
    return arrayOfRooms.filter(isValidRoom);
  }, [rooms]);

  // Form setup with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      applicable_room_type: "",
      applicable_room_name: "",
      meal_plan: "",
      room_price: 0,
      rate_plan_name: "",
      rate_plan_description: "",
      min_length_stay: 0,
      max_length_stay: 0,
      min_book_advance: 0,
      max_book_advance: 0,
    },
    resolver: zodResolver(ratePlanSchema),
  });

  // Create a safe mapping of room names to IDs
  globalRoomMappings.roomNameToId =
    validRooms.length > 0
      ? Object.fromEntries(
          validRooms.map((room) => {
            console.log(`Room Name: ${room.room_name}, Room ID: ${room._id}`);
            return [room.room_name, room._id];
          })
        )
      : {};
  globalRoomMappings.roomIdToName =
    validRooms.length > 0
      ? Object.fromEntries(
          validRooms.map((room) => {
            console.log(`Room ID: ${room._id}, Room Name: ${room.room_name}`);
            return [room._id, room.room_name];
          })
        )
      : {};

  // Toggle create mode
  const handleCreateToggle = () => {
    setIsCreating(!isCreating);
    setIsEditing(false);
    reset();
  };

  // Handle edit mode for a rate plan
  const handleEditRatePlan = (ratePlan: RatePlanType) => {
    console.log("Editing Rate Plan:", JSON.stringify(ratePlan));
    if (!ratePlan._id || !/^[0-9a-fA-F]{24}$/.test(ratePlan._id)) {
      console.error("Invalid rate plan ID:", ratePlan._id);
      toast.error("Cannot edit rate plan: Invalid ID");
      return;
    }
    setIsEditing(true);
    setIsCreating(false);
    console.log("rate plan", ratePlan);
    setSelectedRatePlan(ratePlan);
    const roomId = ratePlan.applicable_room_type || "";
    const roomName = ratePlan.applicable_room_name || "";
    setValue("applicable_room_type", roomId);
    setValue("applicable_room_name", roomName);
    setValue("meal_plan", ratePlan.meal_plan || "");
    setValue("room_price", ratePlan.room_price || 0);
    setValue("rate_plan_name", ratePlan.rate_plan_name || "");
    setValue("rate_plan_description", ratePlan.rate_plan_description || "");
    setValue("min_length_stay", ratePlan.min_length_stay || 0);
    setValue("max_length_stay", ratePlan.max_length_stay || 0);
    setValue("min_book_advance", ratePlan.min_book_advance || 0);
    setValue("max_book_advance", ratePlan.max_length_stay || 0);
  };
  useEffect(() => {
    if (selectedRatePlan) {
      console.log("✅ selectedRatePlan updated:", selectedRatePlan);
    }
  }, [selectedRatePlan]);
  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRatePlan(null);
    reset();
  };

  useEffect(() => {
    const hasFetched = { current: false };
    const fetchRatePlans = async () => {
      if (hasFetched.current) return;
      setLoading(true);
      try {
        let roomsToUse = validRooms;
        if (roomsToUse.length === 0) {
          const roomsResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/rooms/${property_id}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          roomsToUse = roomsResponse.data.filter(isValidRoom);
        }
        console.log("")
        if (roomsToUse.length === 0) {
          console.warn("No valid rooms available");
          toast.error("No rooms available to fetch rate plans");
          return;
        }
        const roomId = roomsToUse[0]._id;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/price/${roomId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (response.status === 200) {
          // toast.success("Fetched rate plans successfully!");
          console.log(
            "#####################\nThe rate plans are:",
            response.data
          );
          // const id = response.data.ratePlanList[0]?._id;
          setRatePlanId( null);
          setRatePlan(response.data.ratePlanList || []);
          hasFetched.current = true;
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        // toast.error("Failed to fetch rate plans");
      } finally {
        setLoading(false);
      }
    };

    if (property_id && accessToken) {
      fetchRatePlans();
    }
  }, [validRooms]);

  // Submit handler for creating a new rate plan
  const onCreateSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const selectedRoom = validRooms.find(
        (room) => room._id === data.applicable_room_type
      );
      const requestData = {
        ...data,
        applicable_room_type: data.applicable_room_type,
        applicable_room_name:
          selectedRoom?.room_name || data.applicable_room_name,
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/price/${property_id}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("resonse", response);
        toast.success("Rate Plan created successfully!");
        setRatePlan(response.data);
        setIsCreating(false);
      }
    } catch (err) {
      toast.error("Failed to create rate plan");
      console.error("Error creating rate plan:", err);
    } finally {
      setLoading(false);
    }
  };

  // Submit handler for updating an existing rate plan
  const onEditSubmit = async (data: FormValues) => {
    setLoading(true);
    console.log(`###################Entering into Edit function`);
    try {
      console.log(`###################Entering into try`);
      console.log("Selected Rate Plan:", JSON.stringify(selectedRatePlan));
      const rateplan_id = ratePlanId || selectedRatePlan?._id;
      console.log(`###################Rate Plan ID: ${rateplan_id}`);
      if (!rateplan_id) {
        throw new Error("Rate plan ID is missing");
      }
      // Validate ObjectId format (24-character hex string)
      if (!/^[0-9a-fA-F]{24}$/.test(rateplan_id)) {
        throw new Error(`Invalid rate plan ID: ${rateplan_id}`);
      }
      console.log(`###################Entering into 2`);
      const selectedRoom = validRooms.find(
        (room) => room._id === data.applicable_room_type
      );
      const requestData = {
        ...data,
        applicable_room_type: data.applicable_room_type,
        applicable_room_name:
          selectedRoom?.room_name || data.applicable_room_name,
      };
      console.log(
        `@@@@@@@@@@@@!!!!!!!!!The requested data is: ${JSON.stringify(
          requestData
        )}`
      );
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/price/${rateplan_id}`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
      if (response.status === 200) {
        toast.success("Rate Plan updated successfully!");
        console.log("response after submit", response);
        const updatedPlan = response.data.updatedRatePlan || response.data.data;
        setRatePlanList((prevList) =>
         prevList.map((plan) =>
      plan._id === updatedPlan._id ? updatedPlan : plan
    )
   );        
   setRatePlan(updatedPlan);
   setSelectedRatePlan(updatedPlan);
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error("Error updating rate plan:", {
        message: err.message,
        response: err.response
          ? {
              status: err.response.status,
              data: err.response.data,
            }
          : null,
      });
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to update rate plan";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
console.log("rate plan list afterv the submit",ratePlanList)
  // Check if we can create a rate plan
  const cantCreate =
    validRooms.length > 0
      ? validRooms.every((room) => room.rateplan_created === true)
      : true;

  // Render a form for creating or editing rate plans
  const renderRatePlanForm = (
    onSubmitHandler: (data: FormValues) => Promise<void>,
    formTitle: string,
    buttonText: string
  ) => (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-6">
      <div className="grid grid-cols-1 gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="applicable_room_name">
              Applicable Room Name <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => {
                setValue("applicable_room_type", value);
                const selectedRoom = validRooms.find(
                  (room) => room._id === value
                );
                setValue("applicable_room_name", selectedRoom?.room_name || "");
              }}
              defaultValue={selectedRatePlan?.applicable_room_type || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a room name" />
              </SelectTrigger>
              <SelectContent>
                {validRooms.map((room) => (
                  <SelectItem
                    key={room._id}
                    value={room._id}
                    disabled={isCreating && room.rateplan_created}
                  >
                    {room.room_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.applicable_room_type && (
              <p className="text-red-500 text-sm mt-1">
                {errors.applicable_room_type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal_plan">
              Meal Plan <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("meal_plan", value)}
              defaultValue={selectedRatePlan?.meal_plan || ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a meal plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Including breakfast">
                  Including breakfast
                </SelectItem>
                <SelectItem value="Including breakfast, lunch and dinner">
                  Including breakfast, lunch and dinner
                </SelectItem>
                <SelectItem value="Including breakfast, lunch or dinner">
                  Including breakfast, lunch or dinner
                </SelectItem>
                <SelectItem value="Room Only">Room Only</SelectItem>
              </SelectContent>
            </Select>
            {errors.meal_plan && (
              <p className="text-red-500 text-sm mt-1">
                {errors.meal_plan.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate_plan_name">
                Rate Plan Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="rate_plan_name"
                {...register("rate_plan_name")}
                placeholder="Rate plan name"
              />
              {errors.rate_plan_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rate_plan_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_price">
                Room Price <span className="text-red-500">*</span>
              </Label>
              <Input
                id="room_price"
                {...register("room_price", { valueAsNumber: true })}
                placeholder="Room price"
                type="number"
              />
              {errors.room_price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.room_price.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate_plan_description">Rate Plan Description</Label>
            <Input
              id="rate_plan_description"
              {...register("rate_plan_description")}
              placeholder="Rate plan description"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_length_stay">
              Min Length of Stay <span className="text-red-500">*</span>
            </Label>
            <Input
              id="min_length_stay"
              {...register("min_length_stay", { valueAsNumber: true })}
              placeholder="Minimum length stay"
              type="number"
            />
            {errors.min_length_stay && (
              <p className="text-red-500 text-sm mt-1">
                {errors.min_length_stay.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_length_stay">Max Length of Stay</Label>
            <Input
              id="max_length_stay"
              {...register("max_length_stay", { valueAsNumber: true })}
              placeholder="Maximum length stay (0 for unlimited)"
              type="number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min_book_advance">
              Min Book Advance <span className="text-red-500">*</span>
            </Label>
            <Input
              id="min_book_advance"
              {...register("min_book_advance", { valueAsNumber: true })}
              placeholder="Minimum book advance"
              type="number"
            />
            {errors.min_book_advance && (
              <p className="text-red-500 text-sm mt-1">
                {errors.min_book_advance.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_book_advance">Max Book Advance</Label>
            <Input
              id="max_book_advance"
              {...register("max_book_advance", { valueAsNumber: true })}
              placeholder="Maximum book advance (0 for unlimited)"
              type="number"
            />
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          type="button"
          onClick={isCreating ? handleCreateToggle : handleCancelEdit}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || loading}>
          {loading ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              {formTitle === "Create Rate Plan" ? "Creating..." : "Updating..."}
            </span>
          ) : (
            buttonText
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="text-xl font-semibold text-primary">
          Rate Plans
        </CardTitle>
        <div className="flex gap-2">
          {isCreating && (
            <Button variant="outline" size="sm" onClick={handleCreateToggle}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
          )}
          {!isCreating && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateToggle}
              disabled={cantCreate && validRooms.length > 0}
            >
              <Plus className="h-4 w-4 mr-1" /> Create
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Create Rate Plan Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="sm:max-w-md md:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Rate Plan</DialogTitle>
            </DialogHeader>
            {cantCreate ? (
              <div className="py-4 text-center text-muted-foreground">
                Create rooms first to create rate plans.
              </div>
            ) : (
              renderRatePlanForm(onCreateSubmit, "Create Rate Plan", "Create")
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Rate Plan Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-md md:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Rate Plan</DialogTitle>
            </DialogHeader>
            {renderRatePlanForm(onEditSubmit, "Edit Rate Plan", "Update")}
          </DialogContent>
        </Dialog>

        {/* Display Rate Plans */}
        <div className="space-y-6">
          {ratePlanList.map((ratePlan) => (
            <Card
              key={ratePlan._id}
              className="overflow-hidden rounded-2xl shadow-md border border-gray-200 dark:border-gray-800"
            >
              <div className="p-6 bg-white dark:bg-transparent">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b pb-2">
                  <div className="text-lg font-semibold text-primary dark:text-primary-light">
                    {ratePlan.applicable_room_name ||
                      ratePlan.applicable_room_type ||
                      "Room name not available"}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditRatePlan(ratePlan)}
                    className="transition hover:bg-gray-100 
                           dark:hover:bg-gray-700"
                  >
                    <PenTool className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </div>

                {/* Rate Plan Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                  {/* Meal Plan */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Meal Plan:
                    </span>
                    <p
                      className="text-lg font-medium 
                              text-gray-800 dark:text-gray-200"
                    >
                      {ratePlan.meal_plan}
                    </p>
                  </div>

                  {/* Room Price */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Room Price:
                    </span>
                    <p
                      className="text-lg font-medium 
                              text-gray-800 dark:text-gray-200"
                    >
                      ₹{ratePlan.room_price}
                    </p>
                  </div>

                  {/* Rate Plan Name */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Rate Plan Name:
                    </span>
                    <p
                      className="text-lg font-medium 
                              text-gray-800 dark:text-gray-200"
                    >
                      {ratePlan.rate_plan_name}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Description:
                    </span>
                    <p
                      className="text-lg font-medium truncate max-w-xs 
                              text-gray-800 dark:text-gray-200"
                    >
                      {ratePlan.rate_plan_description}
                    </p>
                  </div>

                  {/* Min Stay */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Min Stay:
                    </span>
                    <p
                      className="text-lg font-medium 
                              text-gray-800 dark:text-gray-200"
                    >
                      {ratePlan.min_length_stay}
                    </p>
                  </div>

                  {/* Max Stay */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Max Stay:
                    </span>
                    <p
                      className="text-lg font-medium 
                              text-gray-800 dark:text-gray-200"
                    >
                      {ratePlan.max_length_stay === 0
                        ? "Unlimited"
                        : ratePlan.max_length_stay}
                    </p>
                  </div>

                  {/* Min Book Advance */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Min Book Advance:
                    </span>
                    <p
                      className="text-lg font-medium 
                              text-gray-800 dark:text-gray-200"
                    >
                      {ratePlan.min_book_advance}
                    </p>
                  </div>

                  {/* Max Book Advance */}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      Max Book Advance:
                    </span>
                    <p
                      className="text-lg font-medium 
                              text-gray-800 dark:text-gray-200"
                    >
                      {ratePlan.max_book_advance === 0
                        ? "Unlimited"
                        : ratePlan.max_book_advance}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
