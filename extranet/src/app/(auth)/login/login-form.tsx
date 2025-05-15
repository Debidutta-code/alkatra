// "use client";
// import React, { useEffect, useState } from "react";
// import { Button } from "../../../components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../../../components/ui/dialog";
// import { Input } from "../../../components/ui/input";
// import { Label } from "../../../components/ui/label";
// import { Button as NextUIButton } from "@nextui-org/react";
// import { useRouter } from "next/navigation";
// import toast from "react-hot-toast";
// import { CardDescription, CardTitle } from "../../../components/ui/card";
// import { AtSign, Eye, EyeOff, Lock } from "lucide-react";
// import { z } from "zod";
// import { SubmitHandler, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useDispatch } from "./../../../redux/store";
// import { login, getUser  } from "./../../../redux/slices/authSlice";
// import { getProperties } from "./../../../redux/slices/propertySlice";
// import Cookies from "js-cookie";


// type Props = {};

// const loginSchema = z.object({
//   email: z
//     .string()
//     .min(1, "Email is required")
//     .email("Please provide a valid email address"),
//   password: z
//     .string()
//     .regex(
//       /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*\d.*\d.*\d).{8,}$/,
//       "Password should contain at least one uppercase letter, one special character, and be at least 8 characters long"
//     )
//     .min(1, "Password is required"),
// });

// type Inputs = {
//   email: string;
//   password: string;
// };

// const LoginForm: React.FC<Props> = () => {
//   const [openDialog, setOpenDialog] = useState<boolean>(false);
//   const [isVisible, setIsVisible] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(false);
//   const dispatch = useDispatch();
//   const router = useRouter();

//   const form = useForm<Inputs>({
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//     resolver: zodResolver(loginSchema),
//   });

//   const { register, handleSubmit, formState } = form;
//   const {
//     errors: { email: emailError, password: passwordError },
//   } = formState;

//   useEffect(() => {
//     if (emailError?.message) {
//       toast.error(emailError.message);
//     }
//     if (passwordError?.message) {
//       toast.error(passwordError.message);
//     }
//   }, [emailError, passwordError]);

//   const onSubmit: SubmitHandler<Inputs> = async (data) => {
//     setLoading(true);
//     try {
//       await dispatch(login(data));
//       await dispatch(getUser());
//       await dispatch(getProperties());
      
//       toast.success("Login successful!");
//       router.push("/app/property");
//     } catch (err) {
//       toast.error("Login failed. Please check your credentials.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleVisibility = () => setIsVisible((prev) => !prev);

//   return (
//     <div className="w-[500px]">
//       <div className="mb-10">
//         <CardTitle className="text-5xl">
//           Login | <span className="font-normal text-xl">TripSwift</span>
//         </CardTitle>
//       </div>
//       <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
//         <div className="mb-10 space-y-4">
//           <div>
//             <Label htmlFor="email">Email</Label>
//             <Input
//               withIcon
//               startIcon={<AtSign size={20} />}
//               size={"lg"}
//               {...register("email")}
//               variant={emailError ? "error" : undefined}
//               type="email"
//             />
//           </div>
//           <div>
//             <Label htmlFor="password">Password</Label>
//             <Input
//               {...register("password")}
//               withIcon
//               startIcon={<Lock size={20} />}
//               variant={passwordError ? "error" : undefined}
//               endIcon={
//                 <Button
//                   variant={"ghost"}
//                   onClick={toggleVisibility}
//                   className="px-0 py-0 hover:bg-transparent"
//                   type="button"
//                 >
//                   {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
//                 </Button>
//               }
//               size={"lg"}
//               type={isVisible ? "text" : "password"}
//             />
//           </div>
//           <CardDescription>
//             <Dialog open={openDialog} onOpenChange={setOpenDialog}>
//               <DialogTrigger className="underline hover:text-foreground transition-all duration-200">
//                 Forgot your password?
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Reset Password</DialogTitle>
//                   <DialogDescription>
//                     Reset your profile password
//                   </DialogDescription>
//                 </DialogHeader>
//                 <form action="">
//                   <div>
//                     <Label htmlFor="email-for-resetPassword">Email</Label>
//                     <Input
//                       id="email-for-resetPassword"
//                       name="newPassword"
//                       type="password"
//                       placeholder="Email"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="newPassword">New Password</Label>
//                     <Input
//                       id="newPassword"
//                       name="newPassword"
//                       type="password"
//                       placeholder="New password"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="confirmPassword">Confirm Password</Label>
//                     <Input
//                       id="confirmPassword"
//                       name="confirmPassword"
//                       type="password"
//                       placeholder="Confirm new password"
//                     />
//                   </div>
//                   <div className="mt-4">
//                     <Button
//                       type="button"
//                       onClick={() => setOpenDialog(false)}
//                       variant={"ghost"}
//                     >
//                       Cancel
//                     </Button>
//                     <Button type="submit">Reset</Button>
//                   </div>
//                 </form>
//               </DialogContent>
//             </Dialog>
//           </CardDescription>
//         </div>
//         <div className="flex flex-col items-center">
//           <span>
//             Don&apos;t have an account?{" "}
//             <Button
//               type="button"
//               className="px-0"
//               onClick={() => router.push("/register")}
//               variant={"link"}
//             >
//               Register
//             </Button>
//           </span>
//           <SubmitButton loading={loading} />
//         </div>
//       </form>
//     </div>
//   );
// };

// interface SubmitButtonProps {
//   loading: boolean;
// }

// const SubmitButton: React.FC<SubmitButtonProps> = ({ loading }) => {
//   return (
//     <NextUIButton
//       size="lg"
//       type="submit"
//       variant="solid"
//       className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
//       isLoading={loading}
//     >
//       Login
//     </NextUIButton>
//   );
// };

// export default LoginForm;