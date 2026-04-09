"use client"

import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const roleLabels = {
  user: "普通用户",
  tc: "TC 管理员",
  admin: "系统管理员",
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile } = useAuthStore()
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  if (!user) return null

  const handleSave = async () => {
    setSaving(true)
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 500))
    updateProfile(form)
    setMessage("保存成功")
    setSaving(false)
    setTimeout(() => setMessage(""), 2000)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">个人信息</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {user.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                @{user.username}
                <Badge variant="secondary">{roleLabels[user.role]}</Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={user.username}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">用户名不可修改</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">手机号</Label>
            <Input
              id="phone"
              placeholder="请输入手机号"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>所属局点</Label>
            <div className="flex flex-wrap gap-2">
              {user.sites && user.sites.length > 0 ? (
                user.sites.map((siteId) => (
                  <Badge key={siteId} variant="outline">{siteId}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">暂无局点权限</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "保存中..." : "保存修改"}
            </Button>
            {message && (
              <span className="text-sm text-green-600">{message}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
