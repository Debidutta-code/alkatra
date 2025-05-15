// "use server";

import axios, { AxiosError } from "axios";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError, z } from "zod";

interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
}

// REGISTER
export async function register(prevState: any, formData: FormData) {
  const schema = z.object({
    firstname: z.string().min(1, "Firstname is required"),
    lastname: z.string().min(1, "Lastname is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please provide a valid email address"),
    password: z.string().min(8, "Password must be minimum 8 characters long"),
    role: z.string().default("PROPERTY_MANAGER"),
  });

  try {
    const data = schema.parse({
      firstname: formData.get("firstname"),
      lastname: formData.get("lastname"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
      ...data,
    });
    return { ...res.data };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return { error: err.response?.data?.message };
    } else {
      const zodError = err as ZodError;
      return {
        error: Array.isArray(zodError.issues)
          ? [...zodError.issues]
              .map((issue) => issue?.message)
              .sort((a, b) => b.length - a.length)
          : null,
      };
    }
  }
}

// LOGIN
export async function login(prevState: any, formData: FormData) {
  const schema = z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required"),
  });

  try {
    const data = schema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
      ...data,
    });

    return { ...res.data };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return { error: err.response?.data?.message };
    } else {
      const zodError = err as ZodError;
      return {
        error: Array.isArray(zodError.issues)
          ? [...zodError.issues]
              .map((issue) => issue?.message)
              .sort((a, b) => b.length - a.length)
          : null,
      };
    }
  }
  // const data = schema.parse
}

// CREATE_PROPERTY_DETAILS
export async function createPropertyDetails(
  prevState: any,
  formData: FormData
) {
  const schema = z.object({
    property_name: z.string().min(1, "Property name is required"),
    property_email: z
      .string()
      .min(1, "Property email is required")
      .email("Please provide a valid email address"),
    property_contact: z
      .number({
        description: "The contact must be an integer",
      })
      .min(1, "Property contact is required"),
    star_ratings: z.string().min(1, "Please provide some valid ratings"),
    property_code: z.string().min(1, "Property code is required"),
  });

  try {
    const data = schema.parse({
      property_name: formData.get("property_name"),
      property_email: formData.get("property_email"),
      property_contact: parseInt(formData.get("property_contact") as string),
      star_ratings: formData.get("property_ratings"),
      property_code: formData.get("property_code"),
    });

    const res = axios.post("http://localhost:4000//api/v1/property");
    console.log(res);
  } catch (error) {}
}

export async function uploadPropertyImages(files: File[], formData: FormData) {
  const schema = z.object({
    files: z.array(z.any()),
  });
  // try {
  const data = schema.parse({
    files: formData.getAll("file"),
  });

  //   console.log("hiii");

  //   const res = await axios.post("http://localhost:4000/api/v1/auth/register", {
  //     ...data,
  //   });

  //   console.log(res);
  // } catch (err) {}

  console.log(data);
}
