import { useState } from "react";
import { Bell, Lock, Globe, Palette, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AdminSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    orderAlerts: true,
    lowStockAlerts: true,
    twoFactorAuth: false,
    publicProfile: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Setting updated");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your admin preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">Manage how you receive alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle("pushNotifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Order Alerts</Label>
                <p className="text-xs text-muted-foreground">New order notifications</p>
              </div>
              <Switch
                checked={settings.orderAlerts}
                onCheckedChange={() => handleToggle("orderAlerts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Low Stock Alerts</Label>
                <p className="text-xs text-muted-foreground">Alert when stock is low</p>
              </div>
              <Switch
                checked={settings.lowStockAlerts}
                onCheckedChange={() => handleToggle("lowStockAlerts")}
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">Protect your account</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">Extra security layer</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={() => handleToggle("twoFactorAuth")}
              />
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <Label>Change Password</Label>
              <Input type="password" placeholder="Current password" />
              <Input type="password" placeholder="New password" />
              <Input type="password" placeholder="Confirm new password" />
              <Button className="w-full mt-2">Update Password</Button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Privacy</h3>
              <p className="text-sm text-muted-foreground">Control your visibility</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Public Profile</Label>
                <p className="text-xs text-muted-foreground">Make profile visible to others</p>
              </div>
              <Switch
                checked={settings.publicProfile}
                onCheckedChange={() => handleToggle("publicProfile")}
              />
            </div>
          </div>
        </div>

        {/* Store Settings */}
        <div className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Store Settings</h3>
              <p className="text-sm text-muted-foreground">Configure store options</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input defaultValue="MLC Store" placeholder="Enter store name" />
            </div>

            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input type="email" placeholder="support@store.com" />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <Button className="w-full mt-2">Save Store Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}