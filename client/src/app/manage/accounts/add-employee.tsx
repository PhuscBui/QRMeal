"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreateEmployeeAccountBody,
  CreateEmployeeAccountBodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAddAccountMutation } from "@/queries/useAccount";
import { useUploadMediaMutation } from "@/queries/useMedia";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";

export default function AddEmployee() {
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const addAccountMutation = useAddAccountMutation();
  const uploadMediaMutation = useUploadMediaMutation();

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<CreateEmployeeAccountBodyType>({
    resolver: zodResolver(CreateEmployeeAccountBody),
    defaultValues: {
      name: "",
      email: "",
      avatar: undefined,
      date_of_birth: new Date(),
      password: "",
      confirm_password: "",
    },
  });
  const avatar = form.watch("avatar");
  const name = form.watch("name");
  const previewAvatarFromFile = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return avatar;
  }, [file, avatar]);

  const reset = () => {
    form.reset();
    setFile(null);
  };
  const onSubmit = async (values: CreateEmployeeAccountBodyType) => {
    console.log(values);
    if (addAccountMutation.isPending) return;
    try {
      let body = values;
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        const uploadImageResult = await uploadMediaMutation.mutateAsync(
          formData
        );
        const imageUrl = uploadImageResult.payload.result;
        body = {
          ...values,
          avatar: imageUrl,
        };
      }
      const result = await addAccountMutation.mutateAsync(body);
      toast("", {
        description: result.payload.message,
      });
      reset();
      setOpen(false);
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      });
    }
  };
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Employee
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Create a new account for an employee.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className="grid auto-rows-max items-start gap-4 md:gap-8"
            id="add-employee-form"
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e);
            })}
            onReset={reset}
          >
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-2 items-start justify-center">
                      <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className="rounded-none">
                          {name || "Avatar"}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        type="file"
                        accept="image/*"
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFile(file);
                            field.onChange(
                              "http://localhost:3000/" + file.name
                            );
                          }
                        }}
                        className="hidden"
                      />
                      <button
                        className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="name" className="text-sm font-bold">
                        Name
                      </Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="name" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label
                        htmlFor="date_of_birth"
                        className="text-sm font-bold"
                      >
                        Date Of Birth
                      </Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="date_of_birth"
                          type="date"
                          className="w-fit"
                          value={
                            field.value &&
                            !isNaN(new Date(field.value).getTime())
                              ? new Date(field.value)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(new Date(e.target.value))
                          }
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </div>
                      <FormMessage className="text-xs text-red-500" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="email" className="text-sm font-bold">
                        Email
                      </Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input id="email" className="w-full" {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label htmlFor="password" className="text-sm font-bold">
                        Password
                      </Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="password"
                          className="w-full"
                          type="password"
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center justify-items-start gap-4">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-bold"
                      >
                        Confirm Password
                      </Label>
                      <div className="col-span-3 w-full space-y-2">
                        <Input
                          id="confirmPassword"
                          className="w-full"
                          type="password"
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="add-employee-form">
            Add Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
