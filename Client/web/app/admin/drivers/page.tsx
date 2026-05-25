"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { GoldDivider } from "@/components/ui/gold-divider";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { useApi } from "@/lib/api/use-api";
import type { PublicUserDTO, Role, UserSpecificRoles } from "@/lib/api/types";

interface DriverInfo {
  user: PublicUserDTO;
  roles: string[];
}

export default function AdminDriversPage() {
  const api = useApi();
  const [allUsers, setAllUsers] = useState<PublicUserDTO[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [drivers, setDrivers] = useState<DriverInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Add driver modal
  const [showAdd, setShowAdd] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addLoading, setAddLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!api) return;
    loadData();
  }, [api]);

  async function loadData() {
    if (!api) return;
    setLoading(true);
    try {
      const [users, rolesData] = await Promise.all([api.getUsers(), api.getRoles()]);
      setAllUsers(users);
      setRoles(rolesData);

      // Find users with driver role — fetch all in parallel
      const roleResults = await Promise.allSettled(
        users.map((user) => api.getUserRoles(user.id).then((ur) => ({ user, roles: ur.roles })))
      );
      const driverInfos: DriverInfo[] = roleResults
        .filter((r): r is PromiseFulfilledResult<DriverInfo> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter((info) => info.roles.includes("driver"));
      setDrivers(driverInfos);
    } finally {
      setLoading(false);
    }
  }

  const nonDriverUsers = allUsers.filter(
    (u) => !drivers.some((d) => d.user.id === u.id)
  );

  const filteredNonDrivers = nonDriverUsers.filter((u) => {
    if (!addSearch.trim()) return true;
    const q = addSearch.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  async function addDriver(userId: string) {
    if (!api) return;
    const driverRole = roles.find((r) => r.name === "driver");
    if (!driverRole) {
      alert("Driver role not found in the system.");
      return;
    }
    setAddLoading(userId);
    try {
      await api.assignRole(userId, driverRole.id);
      await loadData();
      setShowAdd(false);
      setAddSearch("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add driver");
    } finally {
      setAddLoading(null);
    }
  }

  async function removeDriver(userId: string) {
    if (!api) return;
    const driverRole = roles.find((r) => r.name === "driver");
    if (!driverRole) return;
    try {
      await api.removeRole(userId, driverRole.id);
      setDrivers((prev) => prev.filter((d) => d.user.id !== userId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove driver");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted animate-pulse">Loading drivers&hellip;</p>
      </div>
    );
  }

  return (
    <FadeIn>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">Drivers</h1>
            <p className="text-sm text-muted mt-1">
              {drivers.length} active driver{drivers.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowAdd(true)}>Add Driver</Button>
        </div>

        {/* Driver cards */}
        {drivers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-muted mb-4">No drivers registered yet.</p>
              <Button onClick={() => setShowAdd(true)}>Add Your First Driver</Button>
            </CardContent>
          </Card>
        ) : (
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" staggerDelay={0.08}>
            {drivers.map((d) => (
              <StaggerItem key={d.user.id}>
                <Card>
                  <CardContent>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{d.user.username}</p>
                        <p className="text-xs text-muted">{d.user.email}</p>
                      </div>
                      <StatusBadge variant={d.user.deleted_at ? "error" : "success"}>
                        {d.user.deleted_at ? "Inactive" : "Active"}
                      </StatusBadge>
                    </div>

                    <div className="space-y-1 text-sm text-muted mb-4">
                      <p>Phone: {d.user.phone_number || "\u2014"}</p>
                      <p>Joined: {new Date(d.user.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {d.roles.map((role) => (
                        <span
                          key={role}
                          className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent"
                        >
                          {role}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {d.user.phone_number && (
                        <a
                          href={`tel:${d.user.phone_number}`}
                          className="text-xs text-accent hover:underline"
                        >
                          Call
                        </a>
                      )}
                      {d.user.phone_number && (
                        <a
                          href={`https://wa.me/${d.user.phone_number.replace(/\s/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#25D366] hover:underline"
                        >
                          WhatsApp
                        </a>
                      )}
                      <button
                        onClick={() => removeDriver(d.user.id)}
                        className="text-xs text-red-400 hover:underline ml-auto cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {/* Add Driver Modal */}
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Driver">
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Select an existing user to assign the driver role.
            </p>
            <Input
              placeholder="Search users by name or email..."
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
            />
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredNonDrivers.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">
                  {addSearch ? "No matching users." : "All users are already drivers."}
                </p>
              ) : (
                filteredNonDrivers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-border hover:bg-surface-hover transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{u.username}</p>
                      <p className="text-xs text-muted">{u.email} &middot; {u.phone_number || "No phone"}</p>
                    </div>
                    <Button
                      size="sm"
                      loading={addLoading === u.id}
                      onClick={() => addDriver(u.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Modal>
      </div>
    </FadeIn>
  );
}
