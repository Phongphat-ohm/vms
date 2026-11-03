"use client";

import * as React from "react";
import { UserCheck, Plus, Shield, Mail, Phone, Lock, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { publicConfig } from "@/lib/config";
import { formatThaiPhoneNumber } from "@/lib/formatters";
import {
  listUsersAction,
  toggleUserStatusAction,
} from "@/modules/users/actions";
import { UserItemDto } from "@/modules/users/types";
import { CreateUserModal } from "@/components/users/create-user-modal";

export default function UsersPage() {
  const [users, setUsers] = React.useState<UserItemDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const fetchUsers = React.useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await listUsersAction();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (userItem: UserItemDto) => {
    const isCurrentlyActive = userItem.isActive;
    const confirm = await Swal.fire({
      title: isCurrentlyActive ? "ระงับการใช้งานบัญชี?" : "เปิดใช้งานบัญชี?",
      text: `ท่านต้องการเปลี่ยนสถานะบัญชีของ ${userItem.fullName} หรือไม่`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยันการเปลี่ยนสถานะ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: isCurrentlyActive ? "#E11D48" : "#3B82F6",
      cancelButtonColor: "#94A3B8",
      customClass: { popup: "rounded-[24px]" },
    });

    if (confirm.isConfirmed) {
      setTogglingId(userItem.id);
      try {
        const res = await toggleUserStatusAction(userItem.id);
        if (res.success) {
          await Swal.fire({
            title: "สำเร็จ",
            text: res.message || "ปรับปรุงสถานะผู้ใช้เรียบร้อยแล้ว",
            icon: "success",
            confirmButtonColor: "#3B82F6",
            customClass: { popup: "rounded-[24px]" },
          });
          fetchUsers();
        } else {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: res.error?.message || "ไม่สามารถเปลี่ยนสถานะได้",
            icon: "error",
            confirmButtonColor: "#3B82F6",
            customClass: { popup: "rounded-[24px]" },
          });
        }
      } catch (err: any) {
        Swal.fire("ข้อผิดพลาด", err.message || "การเชื่อมต่อขัดข้อง", "error");
      } finally {
        setTogglingId(null);
      }
    }
  };

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            การจัดการผู้ใช้งานระบบ
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
            ควบคุมบัญชีเจ้าหน้าที่และกำหนดขอบเขตหมู่บ้านที่ได้รับอนุญาต (Multi-Village Scope)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing || loading}
            className="h-11 rounded-xl text-xs font-semibold px-3.5 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>

          <Button
            onClick={handleCreateUser}
            className="h-11 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs sm:text-sm font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            เพิ่มผู้ใช้งานใหม่
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-[32px] bg-white border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">เจ้าหน้าที่</th>
                <th className="py-3.5 px-6">อีเมลและเบอร์โทร</th>
                <th className="py-3.5 px-6">บทบาท (Role)</th>
                <th className="py-3.5 px-6">ขอบเขตหมู่บ้าน</th>
                <th className="py-3.5 px-6">สถานะ</th>
                <th className="py-3.5 px-6 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span>กำลังโหลดรายชื่อเจ้าหน้าที่...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isThisToggling = togglingId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {user.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <div>{user.fullName}</div>
                            <div className="text-xs text-slate-500 font-normal">
                              เข้าใช้งานล่าสุด: {user.lastLogin}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span className="font-mono">{formatThaiPhoneNumber(user.phoneNumber) || "ไม่ได้ระบุ"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                          {user.roleDisplayName || user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {user.villageName}
                      </td>
                      <td className="py-4 px-6">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="h-3 w-3" /> ใช้งานปกติ
                          </span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            ระงับบัญชี
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isThisToggling}
                          onClick={() => handleToggleStatus(user)}
                          className="h-8 rounded-lg text-xs font-semibold"
                        >
                          {isThisToggling ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1 text-blue-600" />
                              กำลังบันทึก...
                            </>
                          ) : user.isActive ? (
                            "ระงับสิทธิ์"
                          ) : (
                            "เปิดใช้งาน"
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standard Accessible Modal for Creating User */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
