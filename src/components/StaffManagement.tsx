import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, ShieldCheck, PencilLine, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

type StaffRow = {
  user_id: string;
  email: string;
  role: "owner" | "admin" | "editor";
  created_at: string;
};

export function StaffManagement() {
  const { t, lang } = useLang();
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor">("editor");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    const { data, error } = await supabase.rpc("list_staff_roles");
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((data ?? []) as StaffRow[]);
  };

  useEffect(() => {
    reload();
  }, []);

  const grant = async () => {
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.rpc("grant_role_by_email", {
      _email: email.trim(),
      _role: role,
    });
    setBusy(false);
    if (error) {
      toast.error(
        error.message.includes("not found") ? t("staff_user_not_found") : error.message
      );
      return;
    }
    toast.success(t("staff_granted"));
    setEmail("");
    reload();
  };

  const revoke = async (r: StaffRow) => {
    if (r.role === "owner") return;
    if (!confirm(`${t("staff_revoke")}: ${r.email} (${r.role})?`)) return;
    const { error } = await supabase.rpc("revoke_role_by_email", {
      _email: r.email,
      _role: r.role,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("staff_revoked"));
    reload();
  };

  const roleIcon = (r: StaffRow["role"]) => {
    if (r === "owner") return <Crown className="h-4 w-4 text-amber-500" />;
    if (r === "admin") return <ShieldCheck className="h-4 w-4 text-primary" />;
    return <PencilLine className="h-4 w-4 text-foreground/70" />;
  };
  const roleLabel = (r: StaffRow["role"]) => {
    if (r === "owner") return t("staff_role_owner");
    if (r === "admin") return t("staff_role_admin");
    return t("staff_role_editor");
  };

  return (
    <div className="mb-10 rounded-2xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h2 className="font-display text-lg font-bold">{t("staff_title")}</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("staff_sub")}</p>
      </div>

      <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-[1fr_180px_auto]">
        <div>
          <Label className="text-xs">{t("staff_email")}</Label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">{lang === "ru" ? "Роль" : "Role"}</Label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "editor")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
          >
            <option value="editor">{t("staff_role_editor")}</option>
            <option value="admin">{t("staff_role_admin")}</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button onClick={grant} disabled={busy || !email.trim()} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4" />
            {t("staff_grant")}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          {lang === "ru" ? "Нет назначенных ролей" : "No role assignments"}
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">{lang === "ru" ? "Роль" : "Role"}</th>
              <th className="p-3 text-left">{lang === "ru" ? "Назначено" : "Assigned"}</th>
              <th className="p-3 text-right">{lang === "ru" ? "Действие" : "Action"}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.user_id}-${r.role}`} className="border-t border-border">
                <td className="p-3 font-medium">{r.email}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5">
                    {roleIcon(r.role)}
                    {roleLabel(r.role)}
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  {r.role !== "owner" && (
                    <Button variant="ghost" size="sm" onClick={() => revoke(r)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
