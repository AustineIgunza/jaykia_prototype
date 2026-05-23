"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
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

  // Detail modal
  const [selectedUser, setSelectedUser] = useState<PublicUserDTO | null>(null);
  const [userRoles, setUserRoles] = useState<UserSpecificRoles | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (!api) return;
    Promise.all([api.getUsers(), api.getRoles()])
      .then(([u, r]) => {
        setUsers(u);
        setRoles(r);
      })
      .finally(() => setLoading(false));
  }, [api]);

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

  if (loading) return <SkeletonTable rows={5} />;

  return (
    <FadeIn>
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Users &amp; Roles</h1>

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
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.username}</TableCell>
                  <TableCell className="text-xs">{u.email}</TableCell>
                  <TableCell className="text-xs">{u.phone_number || "\u2014"}</TableCell>
                  <TableCell>
                    <StatusBadge variant={u.oauth ? "info" : "pending"}>
                      {u.oauth ? "OAuth" : "Legacy"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openUserDetail(u)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GoldDivider />

      {/* Roles Overview */}
      <h2 className="font-display text-xl font-semibold mb-4">Available Roles</h2>
      <div className="flex flex-wrap gap-3 mb-8">
        {roles.map((r) => (
          <Card key={r.id} className="px-4 py-2">
            <p className="font-semibold text-sm">{r.name}</p>
            <p className="text-xs text-muted">{r.description}</p>
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
                    ...roles.map((r) => ({ value: String(r.id), label: r.name })),
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
          </div>
        )}
      </Modal>
    </div>
    </FadeIn>
  );
}
