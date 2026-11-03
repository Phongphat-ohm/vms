"use client";

import * as React from "react";
import { ShieldCheck, Shield, Key, Check, Plus, RefreshCw, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { listRolesAction, updateRolePermissionsAction } from "@/modules/roles/actions";
import { RoleDto, DEFAULT_PERMISSION_CATEGORIES } from "@/modules/roles/types";

export default function RolesPage() {
  const [roles, setRoles] = React.useState<RoleDto[]>([]);
  const [selectedRole, setSelectedRole] = React.useState<RoleDto | null>(null);
  const [activePermissions, setActivePermissions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const selectedRoleRef = React.useRef<RoleDto | null>(null);
  selectedRoleRef.current = selectedRole;

  const fetchRoles = React.useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await listRolesAction();
      if (res.success && res.data) {
        setRoles(res.data);
        const currentSelected = selectedRoleRef.current;
        if (!currentSelected && res.data.length > 0) {
          setSelectedRole(res.data[0]);
          setActivePermissions(res.data[0].permissionCodes);
        } else if (currentSelected) {
          const updatedSelected = res.data.find((r) => r.id === currentSelected.id);
          if (updatedSelected) {
            setSelectedRole(updatedSelected);
            setActivePermissions(updatedSelected.permissionCodes);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load roles:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleSelectRole = (role: RoleDto) => {
    setSelectedRole(role);
    setActivePermissions(role.permissionCodes);
  };

  const handleTogglePermission = (code: string) => {
    if (selectedRole?.name === "SYSTEM_ADMIN") {
      Swal.fire("ไม่อนุญาต", "บทบาท SYSTEM_ADMIN ต้องมีสิทธิ์เต็มทุกส่วนของระบบเสมอ", "info");
      return;
    }

    setActivePermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    setIsSaving(true);
    try {
      const res = await updateRolePermissionsAction(selectedRole.id, activePermissions);
      if (res.success) {
        await Swal.fire({
          title: "บันทึกสิทธิ์สำเร็จ",
          text: `ปรับปรุงสิทธิ์ของบทบาท ${selectedRole.displayName} เรียบร้อยแล้ว`,
          icon: "success",
          confirmButtonColor: "#3B82F6",
          customClass: { popup: "rounded-[24px]" },
        });
        fetchRoles();
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: res.error?.message || "ไม่สามารถปรับปรุงสิทธิ์ได้",
          icon: "error",
          confirmButtonColor: "#3B82F6",
          customClass: { popup: "rounded-[24px]" },
        });
      }
    } catch (err: any) {
      Swal.fire("ข้อผิดพลาด", err.message || "การเชื่อมต่อขัดข้อง", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            บทบาทและทะเบียนสิทธิ์ (Dynamic RBAC)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">
            จัดการสิทธิ์การเข้าถึงแบบละเอียด (Granular Permissions) ป้องกันการยกระดับสิทธิ์และตรวจจับสิทธิ์ที่ Server ทุกครั้ง
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => fetchRoles(true)}
            disabled={isRefreshing || loading}
            className="h-10 rounded-xl text-xs font-semibold px-3.5 text-slate-600 hover:text-slate-900"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>

          {selectedRole && selectedRole.name !== "SYSTEM_ADMIN" && (
            <Button
              onClick={handleSavePermissions}
              disabled={isSaving}
              className="h-10 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold px-4 shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  กำลังบันทึกสิทธิ์...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  บันทึกสิทธิ์บทบาทนี้
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center items-center gap-2 text-slate-500 text-xs">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            กำลังโหลดบทบาท...
          </div>
        ) : (
          roles.map((role) => {
            const isSelected = selectedRole?.id === role.id;

            return (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`rounded-[32px] bg-white border p-6 shadow-sm flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md"
                    : "border-slate-100 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${role.color}`}>
                      {role.permissionCodes.length} สิทธิ์
                    </span>
                    <ShieldCheck className={`h-5 w-5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                  </div>

                  <h2 className="text-sm font-bold text-slate-900 mt-3">{role.displayName}</h2>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{role.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 font-mono text-xs text-slate-500 flex items-center justify-between">
                  <span>ROLE_ID: {role.name}</span>
                  {isSelected && <span className="text-blue-600 font-bold">กำลังเลือก</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Permission Registry Matrix */}
      <div className="rounded-[32px] bg-white border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ทะเบียนรหัสสิทธิ์สำหรับ: {selectedRole?.displayName || "เลือกบทบาทด้านบน"}
            </h2>
            <p className="text-xs text-slate-500">
              {selectedRole?.name === "SYSTEM_ADMIN"
                ? "บทบาทนี้มีสิทธิ์อัตโนมัติครบทุกรายการ (System Invariant)"
                : "คลิกเพื่อเปิด/ปิดสิทธิ์สำหรับบทบาทนี้ จากนั้นกดบันทึก"}
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600">
            เปิดใช้งาน: <span className="font-bold text-blue-600">{activePermissions.length}</span> / 23 รายการ
          </div>
        </div>

        <div className="space-y-6">
          {DEFAULT_PERMISSION_CATEGORIES.map((cat) => (
            <div key={cat.category} className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-blue-600" />
                {cat.category}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cat.permissions.map((p) => {
                  const isGranted = activePermissions.includes(p.code);
                  const isLockedAdmin = selectedRole?.name === "SYSTEM_ADMIN";

                  return (
                    <div
                      key={p.code}
                      onClick={() => !isLockedAdmin && handleTogglePermission(p.code)}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                        !isLockedAdmin ? "cursor-pointer" : ""
                      } ${
                        isGranted
                          ? "bg-blue-50/50 border-blue-200"
                          : "bg-slate-50/60 border-slate-100 opacity-60"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isGranted
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isGranted && <Check className="h-3.5 w-3.5" />}
                      </div>

                      <div>
                        <div className="font-mono text-xs font-bold text-slate-900 flex items-center gap-2">
                          {p.code}
                          {isGranted && (
                            <span className="text-xs font-semibold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                              อนุญาต
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">{p.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
