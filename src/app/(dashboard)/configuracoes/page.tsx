"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/useToast";

export default function ConfiguracoesPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile state
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [avatar, setAvatar] = useState(session?.user?.image || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileLoading(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, avatar }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Erro ao atualizar perfil.");
      } else {
        await update({ name: data.user.name, email: data.user.email });
        setProfileSuccess(true);
        toast({ title: "Perfil atualizado!" });
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch {
      setProfileError("Erro ao atualizar perfil.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Erro ao alterar senha.");
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSuccess(true);
        toast({ title: "Senha alterada com sucesso!" });
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch {
      setPasswordError("Erro ao alterar senha.");
    } finally {
      setPasswordLoading(false);
    }
  }

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="max-w-2xl space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "profile"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <User className="w-4 h-4" />
          Perfil
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "security"
              ? "border-violet-600 text-violet-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Lock className="w-4 h-4" />
          Segurança
        </button>
      </div>

      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>Atualize seus dados pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Avatar preview */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-600 text-white text-xl font-bold">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{session?.user?.name}</p>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="avatar">URL do avatar (opcional)</Label>
                <Input
                  id="avatar"
                  type="url"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>

              {profileSuccess && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Perfil atualizado com sucesso!</span>
                </div>
              )}
              {profileError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{profileError}</p>
              )}

              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm">Senha alterada com sucesso!</span>
                </div>
              )}
              {passwordError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{passwordError}</p>
              )}

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Alterando..." : "Alterar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
