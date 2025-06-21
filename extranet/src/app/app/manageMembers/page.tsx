"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useSelector ,RootState} from "../../../redux/store";
import { jwtDecode } from "jwt-decode";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../../../components/ui/dialog";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdBy: string;
}

const ManageMembers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  // Get the current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.user);
  // Fetch users and filter by the createdBy field
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        toast.error("You are not authenticated");
        router.push("/login");
        return;
      }

      // Decode the token to get current user's email
      let currentUserEmail = "";
      try {
        const decoded = jwtDecode<{ email: string }>(accessToken);
        currentUserEmail = decoded.email;
      } catch (error) {
        console.error("Error decoding token:", error);
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data && response.data.data && response.data.data.users) {
        // If current user is superAdmin, show all users
        if (currentUser?.role === "superAdmin") {
          setUsers(response.data.data.users);
        } else {
          // Filter users by createdBy field matching current user's email
          const filteredUsers = response.data.data.users.filter(
            (user: User) => user.createdBy === currentUserEmail
          );
          setUsers(filteredUsers);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        toast.error("You are not authenticated");
        router.push("/login");
        return;
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/delete/${userToDelete}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      toast.success("User deleted successfully");
      setDialogOpen(false);
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const openDeleteDialog = (userId: string) => {
    setUserToDelete(userId);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main className="py-8 p-40">
      {" "}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manage Members</h1>
          {currentUser?.role !== "superAdmin" && (
            <p className="text-sm text-gray-500 mt-1">
              You can only view and manage members created by you
            </p>
          )}
        </div>
        <Link href="/app/manageMembers/create">
          <Button variant="outline">
            <Plus size={16} strokeWidth={2.5} className="mr-2" />
            Create Members
          </Button>
        </Link>
      </div>
      <div className="mt-8">
        {" "}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <Table>
            <TableCaption>
              {currentUser?.role === "superAdmin"
                ? "List of all members"
                : "List of members created by you"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Sl No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/app/manageMembers/edit/${user.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(user.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this member?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              member and remove their data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteUser}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ManageMembers;
