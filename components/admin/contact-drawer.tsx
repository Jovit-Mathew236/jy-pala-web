"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { foraneData } from "@/lib/data/diocese";
import { useState } from "react";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  forane: z.string().min(1, "Forane is required"),
  parish: z.string().min(1, "Parish is required"),
  dob: z.string().min(1, "Date of birth is required"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactDrawer() {
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedForane, setSelectedForane] = useState<string>(
    (params?.id as string) || ""
  );

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      forane: (params?.id as string) || "",
      parish: (params?.parishId as string) || "",
      dob: "",
    },
  });

  // Get parishes for selected forane
  const parishes =
    foraneData.find((f) => f.id === selectedForane)?.parishes || [];

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact-person", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          contactNumber: data.phone,
          forane: data.forane,
          parish: data.parish,
          dob: data.dob,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create contact person");
      }

      toast.success("Contact person added successfully");
      form.reset();
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to add contact person");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex justify-center">
          <div className="border-4 border-primary rounded-full">
            <Button
              className="w-12 h-12 rounded-full bg-primary border-4 border-background text-white flex items-center justify-center shadow-md"
              size="icon"
              variant="default"
            >
              <span className="text-2xl">+</span>
            </Button>
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent className="px-4">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-6">
            <DrawerTitle className="text-2xl font-bold">
              Add a contact
            </DrawerTitle>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pb-8"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-base">
                      Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter name"
                        className="h-14 rounded-xl border-input bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-base">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        className="h-14 rounded-xl border-input bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="forane"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-base">
                      Forane
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedForane(value);
                        // Reset parish when forane changes
                        form.setValue("parish", "");
                      }}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="h-14 w-full rounded-xl border-input bg-background">
                        <SelectValue placeholder="Select Forane" />
                      </SelectTrigger>
                      <SelectContent>
                        {foraneData.map((forane) => (
                          <SelectItem key={forane.id} value={forane.id}>
                            {forane.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-base">
                      Parish
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedForane}
                    >
                      <SelectTrigger className="h-14 w-full rounded-xl border-input bg-background">
                        <SelectValue placeholder="Select Parish" />
                      </SelectTrigger>
                      <SelectContent>
                        {parishes.map((parish) => (
                          <SelectItem key={parish.id} value={parish.id}>
                            {parish.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-base">
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-14 rounded-xl border-input bg-background"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 rounded-full bg-primary text-white font-semibold text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "ADD"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
