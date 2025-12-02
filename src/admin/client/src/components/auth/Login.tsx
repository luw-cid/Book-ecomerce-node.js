import axios from "axios";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { BookOpen, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onLogin: (token: string, admin: any) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const { token, admin } = response.data;

        if (rememberMe) {
          localStorage.setItem("adminToken", token);
          localStorage.setItem("adminData", JSON.stringify(admin));
        } else {
          sessionStorage.setItem("adminToken", token);
          sessionStorage.setItem("adminData", JSON.stringify(admin));
        }

        // gọi callback onlogin
        onLogin(token, admin);
      } else {
        setError(response.data.message || "Login failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response) {
        setError(error.response.data.message || "Invalid email or password.");
      } else if (error.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a4d2e] to-[#0d2617] p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-10 h-10 text-[#1a4d2e]" />
            </div>
          </div>
          <h1 className="text-white mb-2">BookStore Admin</h1>
          <p className="text-gray-300">Manage your online bookstore</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@bookstore.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked: any) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="remember"
                    className="cursor-pointer select-none"
                  >
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-[#1a4d2e] hover:underline"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#1a4d2e] hover:bg-[#0d2617]"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            {/* Demo Credentials */}
            {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-2">Demo credentials:</p>
              <p className="text-gray-700">
                <strong>Email:</strong> admin@bookstore.com
              </p>
              <p className="text-gray-700">
                <strong>Password:</strong> admin123
              </p>
            </div> */}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-300">
          <p>&copy; 2025 BookStore Admin. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
