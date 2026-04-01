"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatPersona, PermissionTier, UserRole } from "@/lib/auth-context";
import {
  Database,
  TrendingUp,
  Headphones,
  ArrowLeft,
  Check,
  ShieldCheck,
  Monitor,
} from "lucide-react";
import { RoleCard } from "./role-card";
import {
  CHAT_PERSONA_OPTIONS,
  PERMISSION_TIER_OPTIONS,
  createUser,
  userExists,
  validateUsername,
  validatePassword,
  validateEmail,
} from "@/lib/mock-users";
import { useAuth } from "@/lib/auth-context";

const ROLE_CONFIG = {
  super_admin: {
    label: "Super Administrator",
    description: "Full demo access across all platform capabilities",
    icon: ShieldCheck,
    color: "from-amber-500 to-orange-500",
  },
  data_admin: {
    label: "Data Administrator",
    description: "Identity resolution & data governance",
    icon: Database,
    color: "from-blue-500 to-cyan-500",
  },
  marketing_admin: {
    label: "Marketing Administrator",
    description: "Campaigns & customer engagement",
    icon: TrendingUp,
    color: "from-purple-500 to-pink-500",
  },
  service_agent: {
    label: "Service Agent",
    description: "Customer service & case management",
    icon: Headphones,
    color: "from-green-500 to-emerald-500",
  },
  risk_admin: {
    label: "Platform Operator",
    description: "Cross-domain demo access aligned to the main operator experience",
    icon: Monitor,
    color: "from-stone-500 to-stone-700",
  },
  platform_admin: {
    label: "Platform Administrator",
    description: "Cross-platform orchestration across all modules",
    icon: Monitor,
    color: "from-stone-600 to-stone-800",
  },
};

const PERSONA_DEFAULT_BY_ROLE: Record<UserRole, ChatPersona> = {
  super_admin: "general_user",
  data_admin: "general_user",
  marketing_admin: "marketer",
  service_agent: "merchandiser",
  risk_admin: "general_user",
  platform_admin: "general_user",
};

export function SignupForm() {
  const [step, setStep] = useState<"role" | "details">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [defaultChatPersona, setDefaultChatPersona] = useState<ChatPersona>("marketer");
  const [permissionTier, setPermissionTier] = useState<PermissionTier>("full_admin");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setDefaultChatPersona(PERSONA_DEFAULT_BY_ROLE[role]);
    setStep("details");
    setError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error!);
      return;
    }

    // Check if username exists
    if (userExists(username)) {
      setError("Username already exists");
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error!);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate email if provided
    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        setError(emailValidation.error!);
        return;
      }
    }

    setError("");
    setIsLoading(true);

    // Create user
    const success = createUser(username, password, selectedRole, email || undefined, {
      defaultChatPersona,
      permissionTier,
    });

    if (success) {
      // Auto-login after successful signup
      await login(username, password);
      router.push("/dashboard");
    } else {
      setError("Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  if (step === "role") {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
          <CardDescription className="text-base">
            Select your role to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(
              ([role, config]) => (
                <RoleCard
                  key={role}
                  role={role}
                  label={config.label}
                  description={config.description}
                  icon={config.icon}
                  color={config.color}
                  onClick={() => handleRoleSelect(role)}
                />
              )
            )}
          </div>
          <div className="flex justify-center pt-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const roleConfig = ROLE_CONFIG[selectedRole!];
  const Icon = roleConfig.icon;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${roleConfig.color}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">{roleConfig.label}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">3-15 characters, letters, numbers, and underscores only</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
          </div>
          <div className="space-y-2">
            <Label>Default recommendation persona</Label>
            <Select
              value={defaultChatPersona}
              onValueChange={(value) => setDefaultChatPersona(value as ChatPersona)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default persona" />
              </SelectTrigger>
              <SelectContent>
                {CHAT_PERSONA_OPTIONS.map((persona) => (
                  <SelectItem key={persona.value} value={persona.value}>
                    {persona.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <Select
              value={permissionTier}
              onValueChange={(value) => setPermissionTier(value as PermissionTier)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select permission tier" />
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_TIER_OPTIONS.map((tier) => (
                  <SelectItem key={tier.value} value={tier.value}>
                    {tier.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {PERMISSION_TIER_OPTIONS.find((tier) => tier.value === permissionTier)?.description}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("role");
                setError("");
              }}
              disabled={isLoading}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                "Creating Account..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
