"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  CreditCard,
  Upload,
  Save,
  Tag,
  Image,
  Phone,
  Mail,
  MapPin,
  Lock,
  User,
} from "lucide-react";
import DiscountManagement from "./discount-management";

interface AdminSettings {
  id: string;
  email: string;
  qrisImage?: string;
  bankAccount?: string;
  logo?: string;
  phone?: string;
  contactEmail?: string;
  address?: string;
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    qrisImage: "",
    bankAccount: "",
    logo: "",
    phone: "",
    contactEmail: "",
    address: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      setSettings(data);
      setFormData({
        qrisImage: data.qrisImage || "",
        bankAccount: data.bankAccount || "",
        logo: data.logo || "",
        phone: data.phone || "",
        contactEmail: data.contactEmail || "",
        address: data.address || "",
        email: data.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        alert("Pengaturan berhasil disimpan!");
        // Reset password fields after successful save
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        alert("Gagal menyimpan pengaturan");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      alert("Email tidak boleh kosong");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/update-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSettings(updatedSettings);
        alert("Email berhasil diperbarui!");
      } else {
        const error = await response.json();
        alert(`Gagal memperbarui email: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating email:", error);
      alert("Gagal memperbarui email");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      alert("Semua field password harus diisi");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    if (formData.newPassword.length < 6) {
      alert("Password baru harus memiliki minimal 6 karakter");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/update-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (response.ok) {
        alert("Password berhasil diperbarui!");
        // Reset password fields after successful update
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        const error = await response.json();
        alert(`Gagal memperbarui password: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("Gagal memperbarui password");
    } finally {
      setSaving(false);
    }
  };

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll use a placeholder URL
      // In a real app, you'd upload to a storage service
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          qrisImage: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/admin/upload-logo", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setFormData((prev) => ({ ...prev, logo: result.logoPath }));
          alert("Logo berhasil diupload!");
        } else {
          const error = await response.json();
          alert(`Gagal upload logo: ${error.error}`);
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        alert("Gagal upload logo");
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <Tabs defaultValue="payment" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="payment">Pembayaran</TabsTrigger>
        <TabsTrigger value="logo">Logo</TabsTrigger>
        <TabsTrigger value="contact">Kontak</TabsTrigger>
        <TabsTrigger value="account">Akun</TabsTrigger>
        <TabsTrigger value="discounts">Discount</TabsTrigger>
      </TabsList>

      <TabsContent value="payment" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Pengaturan Pembayaran</h3>
          <p className="text-sm text-gray-600">
            Kelola pengaturan QRIS dan informasi rekening
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* QRIS Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-teal-600" />
                <span>Pengaturan QRIS</span>
              </CardTitle>
              <CardDescription>
                Upload gambar QRIS untuk pembayaran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qrisImage">Gambar QRIS</Label>
                <div className="space-y-3">
                  {formData.qrisImage && (
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-center">
                        <img
                          src={formData.qrisImage}
                          alt="QRIS"
                          className="max-w-xs w-auto h-auto object-contain"
                          style={{ maxHeight: "150px" }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Input
                      id="qrisImage"
                      type="file"
                      accept="image/*"
                      onChange={handleQrisUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("qrisImage")?.click()
                      }
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {formData.qrisImage ? "Ganti QRIS" : "Upload QRIS"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-teal-600" />
                <span>Informasi Rekening</span>
              </CardTitle>
              <CardDescription>Atur nomor rekening bank</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Nomor Rekening</Label>
                <Textarea
                  id="bankAccount"
                  placeholder="Contoh: 1234567890 - Bank Sentul-Laundry (a/n John Doe)"
                  value={formData.bankAccount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bankAccount: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>Informasi akun admin saat ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Email Admin:</span>
                <span className="font-medium">{settings?.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="logo" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Pengaturan Logo</h3>
          <p className="text-sm text-gray-600">
            Upload logo perusahaan yang akan muncul di landing page
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="h-5 w-5 text-teal-600" aria-hidden="true" />
              <span>Logo Perusahaan</span>
            </CardTitle>
            <CardDescription>
              Upload logo dalam format PNG, JPEG, SVG, atau WebP (maksimal 5MB).
              Logo akan ditampilkan dengan frame bundar yang menarik di landing
              page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo Perusahaan</Label>
              <div className="space-y-3">
                {formData.logo && (
                  <div className="border rounded-lg p-6 bg-gradient-to-br from-teal-50 to-cyan-50">
                    <div className="text-center">
                      <div className="relative inline-block group mb-4">
                        {/* Outer ring with gradient */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

                        {/* Middle ring */}
                        <div className="absolute inset-2 rounded-full bg-white/80 backdrop-blur-sm"></div>

                        {/* Inner container with logo */}
                        <div className="relative w-32 h-32 rounded-full bg-white p-2 flex items-center justify-center shadow-xl border-4 border-white/50">
                          <img
                            src={formData.logo}
                            alt="Company Logo Preview"
                            className="w-28 h-28 object-contain rounded-full"
                          />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        Logo Saat Ini
                      </p>
                      <p className="text-xs text-gray-500">
                        Logo akan muncul di landing page dengan frame bundar
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo")?.click()}
                    className="flex-1"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {formData.logo ? "Ganti Logo" : "Upload Logo"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  ✨ Logo akan muncul dengan frame bundar animasi di navigation
                  bar dan hero section landing page
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="contact" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Informasi Kontak</h3>
          <p className="text-sm text-gray-600">
            Kelola informasi kontak yang akan ditampilkan di landing page
          </p>
        </div>

        <div className="grid md:grid-cols-1 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-teal-600" />
                <span>Informasi Kontak</span>
              </CardTitle>
              <CardDescription>
                Atur nomor telepon, email, dan alamat bisnis Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Contoh: +62 812-3456-7890"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
                <p className="text-xs text-gray-500">
                  Nomor telepon yang dapat dihubungi pelanggan
                </p>
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email Kontak</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Contoh: info@sentul-laundry.com"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500">
                  Email untuk pertanyaan dan informasi layanan
                </p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Alamat Bisnis</Label>
                <Textarea
                  id="address"
                  placeholder="Contoh: Jl. Laundry No. 123, Sentul, Bogor, Jawa Barat 16810"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Alamat lengkap tempat usaha Anda
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-teal-600" />
                <span>Preview Tampilan</span>
              </CardTitle>
              <CardDescription>
                Bagaimana informasi kontak akan muncul di landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.phone && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <Phone className="h-5 w-5 text-teal-600" />
                    <span className="font-medium">{formData.phone}</span>
                  </div>
                )}
                {formData.contactEmail && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <Mail className="h-5 w-5 text-teal-600" />
                    <span className="font-medium">{formData.contactEmail}</span>
                  </div>
                )}
                {formData.address && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                    <MapPin className="h-5 w-5 text-teal-600 mt-0.5" />
                    <span className="font-medium text-sm">
                      {formData.address}
                    </span>
                  </div>
                )}
                {!formData.phone &&
                  !formData.contactEmail &&
                  !formData.address && (
                    <p className="text-gray-500 text-center py-4">
                      Belum ada informasi kontak yang diisi
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Menyimpan..." : "Simpan Kontak"}
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="account" className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Pengaturan Akun</h3>
          <p className="text-sm text-gray-600">
            Kelola email dan password akun admin Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-teal-600" />
                <span>Update Email</span>
              </CardTitle>
              <CardDescription>
                Perbarui email untuk login ke sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleEmailUpdate}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Baru</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Contoh: admin@sentul-laundry.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Email ini akan digunakan untuk login ke sistem
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-teal-600 hover:bg-teal-700 w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Menyimpan..." : "Update Email"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-teal-600" />
                <span>Update Password</span>
              </CardTitle>
              <CardDescription>
                Perbarui password untuk keamanan akun
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handlePasswordUpdate}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Masukkan password saat ini"
                      value={formData.currentPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Masukkan password baru (min. 6 karakter)"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Konfirmasi Password Baru
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Masukkan kembali password baru"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Gunakan password yang kuat dengan kombinasi huruf, angka,
                    dan simbol
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-teal-600 hover:bg-teal-700 w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Menyimpan..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-teal-600" />
              <span>Informasi Akun</span>
            </CardTitle>
            <CardDescription>Informasi akun admin saat ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Email Admin:</span>
                <span className="font-medium">{settings?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ID Akun:</span>
                <span className="font-medium">{settings?.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="discounts">
        <DiscountManagement />
      </TabsContent>
    </Tabs>
  );
}
