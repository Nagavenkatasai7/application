"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Phone, MapPin, Linkedin, Github } from "lucide-react";

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  location?: string;
}

interface ContactSectionProps {
  data: ContactData;
  onChange: (data: ContactData) => void;
  disabled?: boolean;
}

export function ContactSection({ data, onChange, disabled }: ContactSectionProps) {
  const handleChange = (field: keyof ContactData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-name"
              value={data.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Phone
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              value={data.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Location
            </Label>
            <Input
              id="contact-location"
              value={data.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="San Francisco, CA"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-linkedin" className="flex items-center gap-2">
              <Linkedin className="w-4 h-4 text-muted-foreground" />
              LinkedIn
            </Label>
            <Input
              id="contact-linkedin"
              value={data.linkedin || ""}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="linkedin.com/in/johndoe"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-github" className="flex items-center gap-2">
              <Github className="w-4 h-4 text-muted-foreground" />
              GitHub
            </Label>
            <Input
              id="contact-github"
              value={data.github || ""}
              onChange={(e) => handleChange("github", e.target.value)}
              placeholder="github.com/johndoe"
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
