import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  contactNumber: z
    .string()
    .min(10, { message: "Enter a valid contact number" }),
  forane: z.string().min(1, { message: "Please select a forane" }),
  parish: z.string().min(1, { message: "Please select a parish" }),
  dob: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
