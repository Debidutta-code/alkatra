"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Plus, Pencil, Trash2, Users, Shield, Mail, User } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useSelector, RootState } from "../../../redux/store";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

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

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get("accessToken");

      if (!accessToken) {
        toast.error("You are not authenticated");
        router.push("/login");
        return;
      }

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
        if (currentUser?.role === "superAdmin") {
          setUsers(response.data.data.users);
        } else {
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return <Shield className="w-3 h-3" />;
      case 'admin':
        return <Users className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen md:mx-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container px-4 py-6 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-tripswift-blue dark:text-blue-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Manage Members
                </h1>
              </div>
              {currentUser?.role !== "superAdmin" && (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 ml-9 sm:ml-11">
                  You can only view and manage members created by you
                </p>
              )}
            </div>
            <Link href="/app/manageMembers/create" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto bg-tripswift-blue hover:bg-tripswift-dark-blue text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Create Member</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Members Table */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              {currentUser?.role === "superAdmin" ? "All Members" : "Your Members"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {currentUser?.role === "superAdmin"
                ? "Manage all system members"
                : "Members created and managed by you"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-tripswift-blue border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Loading members...</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto">
                <Table className="min-w-[600px] sm:min-w-full">
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80">
                      <TableHead className="w-[50px] sm:w-[80px] font-semibold text-slate-700 dark:text-slate-300">
                        #
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Member
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Email
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                        Role
                      </TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 sm:py-12">
                          <div className="flex flex-col items-center gap-2 sm:gap-3">
                            <Users className="w-8 h-8 sm:w-12 sm:h-12 text-slate-400 dark:text-slate-600" />
                            <span className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-400">
                              No members found
                            </span>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">
                              Create your first member to get started
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user, index) => (
                        <TableRow
                          key={user.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                        >
                          <TableCell className="font-medium text-slate-600 dark:text-slate-400">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-tripswift-blue to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium">
                                {user.firstName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100">
                                  {user.firstName} {user.lastName}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
                              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate max-w-[120px] sm:max-w-none">
                                {user.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getRoleBadgeVariant(user.role)}
                              className="flex items-center gap-1 w-fit text-xs sm:text-sm"
                            >
                              {getRoleIcon(user.role)}
                              <span className="capitalize">{user.role}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Link href={`/app/manageMembers/edit?userId=${user.id}`}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-tripswift-blue dark:hover:text-blue-400 transition-colors duration-150"
                                >
                                  <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(user.id)}
                                className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Delete Member
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Are you sure you want to delete this member? This action cannot be undone.
                This will permanently remove the member and all their data from the system.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageMembers;