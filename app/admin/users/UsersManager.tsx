"use client";

import { useState, useTransition } from "react";
import { Search, Loader2, ShieldCheck, Ban, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { updateUserRole, toggleUserBan } from "./actions";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: "STUDENT" | "ADMIN";
  created_at: string;
  is_banned?: boolean;
  orderCount: number;
  totalSpent: number;
}

export function UsersManager({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { toast } = useToast();

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (userId: string, newRole: "STUDENT" | "ADMIN") => {
    setPendingId(userId);
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (!result.success) {
        toast({ variant: "destructive", title: "Couldn't update role", description: result.error });
      } else {
        toast({ variant: "success", title: "Role updated", description: `User is now ${newRole === "ADMIN" ? "an Admin" : "a Student"}.` });
      }
      setPendingId(null);
    });
  };

  const handleBanToggle = (userId: string, currentlyBanned: boolean) => {
    setPendingId(userId);
    startTransition(async () => {
      const result = await toggleUserBan(userId, !currentlyBanned);
      if (!result.success) {
        toast({ variant: "destructive", title: "Couldn't update account", description: result.error });
      } else {
        toast({
          variant: "success",
          title: currentlyBanned ? "Account restored" : "Account banned",
          description: currentlyBanned
            ? "User can sign in and order again."
            : "User can no longer sign in or place orders.",
        });
      }
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="surface-raised border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Orders</TableHead>
                <TableHead className="hidden lg:table-cell">Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                        {user.role === "ADMIN" ? "Admin" : "Student"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{user.orderCount}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm font-medium">
                      {formatCurrency(user.totalSpent)}
                    </TableCell>
                    <TableCell>
                      {user.is_banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {pendingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.role === "STUDENT" ? (
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ADMIN")}>
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleRoleChange(user.id, "STUDENT")}>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                Remove Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleBanToggle(user.id, !!user.is_banned)}
                              className={user.is_banned ? "" : "text-red-500"}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              {user.is_banned ? "Unban User" : "Ban User"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
