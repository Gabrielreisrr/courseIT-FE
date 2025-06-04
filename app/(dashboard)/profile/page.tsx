"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Loader2, User, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { usersApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const response = await usersApi.updateUser(user.id, data);

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: response.error,
        });
      } else {
        toast({
          title: "Profile Updated",
          description:
            "Your profile information has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "We couldn't update your profile. Please try again later.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const response = await usersApi.deleteUser(user.id);

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: response.error,
        });
      } else {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully.",
        });
        logout();
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "We couldn't delete your account. Please try again later.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and profile information.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Personal Information
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    {...register("name")}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    {...register("email")}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={user.role}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card shadow-sm rounded-lg border p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">
                  {user.role}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Account Status</h3>
                <p className="text-sm">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  Active
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Member Since</h3>
                <p className="text-sm text-muted-foreground">May 15, 2025</p>
              </div>
            </div>
          </div>

          <div className="bg-card shadow-sm rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all of your content.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Delete
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
