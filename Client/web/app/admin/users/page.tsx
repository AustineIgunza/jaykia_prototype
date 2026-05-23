"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { GoldDivider } from "@/components/ui/gold-divider";
import { SkeletonTable } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion";
import { useApi } from "@/lib/api/use-api";
import type { PublicUserDTO, Role, UserSpecificRoles } from "@/lib/api/types";

export default function AdminUsersPage() {
  const api = useApi();
  const [users, setUsers] = useState<PublicUserDTO[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Detail modal
  const [selectedUser, setSelectedUser] = useState<PublicUserDTO | null>(null);
  const [userRoles, setUserRoles] = useState<UserSpecificRoles | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roleLoading, setRoleLoading] = useState(false);

  // Flag modal
  const [flagUser, setFlagUser] = useState<PublicUserDTO | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagLoading, setFlagLoading] = useState(false);

  // Delete confirm
  const [deleteUser, setDeleteUser] = useState<PublicUserDTO | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!api) return;
    Promise.all([api.getUsers(), api.getRoles()])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(r);
      })
      .finally(() => setLoading(false));
  }, [api]);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone_number?.toLowerCase().includes(q)
    );
  });

  async function openUserDetail(user: PublicUserDTO) {
    setSelectedUser(user);
    if (!api) return;
    try {
      const ur = await api.getUserRoles(user.id);
      setUserRoles(ur);
    } catch {
      setUserRoles({ userId: user.id, roles: [] });
    }
  }

  async function assignRole() {
    if (!api || !selectedUser || !selectedRoleId) return;
    setRoleLoading(true);
    try {
      await api.assignRole(selectedUser.id, Number(selectedRoleId));
      const ur = await api.getUserRoles(selectedUser.id);
      setUserRoles(ur);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to assign role");
    } finally {
      setRoleLoading(false);
    }
  }

  async function removeRole(roleName: string) {
    if (!api || !selectedUser) return;
    const role = roles.find((r) => r.name === roleName);
    if (!role) return;
    setRoleLoading(true);
    try {
      await api.removeRole(selectedUser.id, role.id);
      const ur = await api.getUserRoles(selectedUser.id);
      setUserRoles(ur);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove role");
    } finally {
      setRoleLoading(false);
    }
  }

  async function handleFlag() {
    if (!api || !flagUser) return;
    setFlagLoading(true);
    try {
      const updated = await api.updateUser(flagUser.id, {
        flag: true,
        flag_reason: flagReason,
      });
      setUsers((prev) => prev.map((u) => (u.id === flagUser.id ? updated : u)));
      setFlagUser(null);
      setFlagReason("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to flag user");
    } finally {
      setFlagLoading(false);
    }
  }

  async function handleUnflag(user: PublicUserDTO) {
    if (!api) return;
    try {
      const updated = await api.updateUser(user.id, { flag: false, flag_reason: "" });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unflag user");
    }
  }

  async function handleDelete() {
    if (!api || !deleteUser) return;
    setDeleteLoading(true);
    try {
      await api.deleteUser(deleteUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <SkeletonTable rows={5} />;

  return (
    <FadeIn>
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Users &amp; Roles</h1>
        <p className="text-sm text-muted">{users.length} total users</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Auth</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted py-8">
                    {search ? "No users match your search." : "No users found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell className="text-xs">{u.phone_number || "\u2014"}</TableCell>
                    <TableCell>
                      <StatusBadge variant={u.oauth ? "info" : "pending"}>
                        {u.oauth ? "OAuth" : "Legacy"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      {u.deleted_at ? (
                        <StatusBadge variant="error">Deleted</StatusBadge>
                      ) : (
                        <StatusBadge variant="success">Active</StatusBadge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openUserDetail(u)}>
                          Manage
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFlagUser(u)}
                          title="Flag user"
                        >
                          Flag
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GoldDivider />

      {/* Roles Overview */}
      <h2 className="font-display text-xl font-semibold mb-4">Available Roles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {roles.map((r) => (
          <Card key={r.id}>
            <CardContent className="py-3">
              <p className="font-semibold text-sm capitalize">{r.name}</p>
              <p className="text-xs text-muted">{r.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Detail / Role Management Modal */}
      <Modal open={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details">
        {selectedUser && (
          <div className="space-y-4">
            <dl className="space-y-2 text-sm">
              {[
                ["ID", selectedUser.id],
                ["Name", selectedUser.username],
                ["Email", selectedUser.email],
                ["Phone", selectedUser.phone_number || "\u2014"],
                ["Auth", selectedUser.oauth ? "OAuth" : "Legacy"],
                ["Joined", new Date(selectedUser.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <GoldDivider className="my-4" />

            <h3 className="font-semibold text-sm">Assigned Roles</h3>
            {userRoles && userRoles.roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {userRoles.roles.map((roleName) => (
                  <span
                    key={roleName}
                    className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs px-2.5 py-1 rounded-full"
                  >
                    {roleName}
                    <button
                      className="hover:text-error transition-colors cursor-pointer ml-1"
                      onClick={() => removeRole(roleName)}
                      aria-label={`Remove ${roleName} role`}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No roles assigned.</p>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Select
                  label="Assign Role"
                  options={[
                    { value: "", label: "Select a role..." },
                    ...roles.map((r) => ({ value: String(r.id), label: `${r.name} — ${r.description}` })),
                  ]}
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                loading={roleLoading}
                disabled={!selectedRoleId}
                onClick={assignRole}
              >
                Assign
              </Button>
            </div>

            <GoldDivider className="my-4" />

            {/* Danger zone */}
            <div className="p-3 rounded-[var(--radius-md)] border border-red-500/20 bg-red-500/5">
              <p className="text-xs text-red-400 uppercase tracking-wider mb-3">Danger Zone</p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDeleteUser(selectedUser);
                    setSelectedUser(null);
                  }}
                >
                  Delete User
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFlagUser(selectedUser);
                    setSelectedUser(null);
                  }}
                >
                  Flag User
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Flag User Modal */}
      <Modal
        open={!!flagUser}
        onClose={() => setFlagUser(null)}
        title="Flag User"
      >
        {flagUser && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Flag <strong className="text-foreground">{flagUser.username}</strong> ({flagUser.email})?
              Flagged users may be restricted from booking.
            </p>
            <Textarea
              label="Reason for Flagging"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g. Repeated no-shows, abusive behavior..."
              required
            />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setFlagUser(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={flagLoading}
                disabled={!flagReason.trim()}
                onClick={handleFlag}
              >
                Flag User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation */}
      <Modal
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Delete User"
      >
        {deleteUser && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Are you sure you want to delete <strong className="text-foreground">{deleteUser.username}</strong> ({deleteUser.email})?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeleteUser(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={deleteLoading}
                onClick={handleDelete}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    </FadeIn>
  );
}
