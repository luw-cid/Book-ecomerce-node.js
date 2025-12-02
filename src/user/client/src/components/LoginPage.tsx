import axios from "axios";
import React from "react";

import { useState, useEffect } from "react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import type { PageType } from "../App";
import { useAuth } from "../context/authContext";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

interface LoginPageProps {
  onNavigate: (page: PageType) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Đảm bảo trang luôn là "login" khi component mount (chỉ chạy một lần)
  useEffect(() => {
    onNavigate("login");
    
    // Kiểm tra error từ query parameter (cho Google OAuth ban)
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
      // Xóa error parameter khỏi URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // Xóa thông báo lỗi cũ
    
    // Đảm bảo trang vẫn là "login" trước khi submit
    onNavigate("login");
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`,
        {
          email: email, 
          password: password
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      console.log('🔍 Login response:', response.data);
      
      // Kiểm tra kỹ response trước khi xử lý
      if (response.data && response.data.success === true && response.data.data) {
        console.log('✅ Login successful, navigating to home');
        const { user, accessToken, refreshToken } = response.data.data;
        
        // Kiểm tra đầy đủ dữ liệu trước khi lưu
        if (!user || !accessToken || !refreshToken) {
          setErrorMessage("Invalid response from server. Please try again.");
          setIsLoading(false);
          // Đảm bảo vẫn ở trang login khi có lỗi
          onNavigate("login");
          return;
        }
        
        // Check if "Remember me" is checked
        const rememberMe = (document.getElementById('remember') as HTMLInputElement)?.checked;
        
        if (rememberMe) {
          // Save to localStorage for persistent login
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        } else {
          // Save to sessionStorage for session-only login
          sessionStorage.setItem('token', accessToken);
          sessionStorage.setItem('refreshToken', refreshToken);
        }
        
        login(user, accessToken, refreshToken); // Lưu vào context với accessToken và refreshToken
        toast.success(response.data.message || "Login successfully!");
        onNavigate("home");
      } else {
        // Nếu không có success hoặc không có data
        console.log('❌ Login failed - response:', response.data);
        setErrorMessage(response.data?.message || "Login failed. Please check your credentials.");
        setIsLoading(false);
        // Đảm bảo vẫn ở trang login khi login thất bại
        onNavigate("login");
      }
    } catch (err: any) {
      // Xử lý lỗi từ axios (401, 500, network error, etc.)
      console.log('❌ Login error:', err.response?.data || err.message);
      
      // Lấy thông báo lỗi từ response
      let errorMsg = "Account or password incorrect. Please try again.";
      
      if (err.response?.data) {
        // Server trả về lỗi với format { success: false, error: { message: ... } }
        errorMsg = err.response.data.error?.message 
          || err.response.data.message 
          || err.response.data.error
          || errorMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setErrorMessage(errorMsg);
      setIsLoading(false);
      // Đảm bảo vẫn ở trang login khi có lỗi
      onNavigate("login");
    }

  };

  const handleRecoverPassword = async () => {
    // Kiểm tra email đã được nhập chưa
    if (!email || email.trim() === "") {
      toast.error("Please enter email to recover password");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/recover-password`,
        { email: email },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if(response.status === 200) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message ?? "Recover password failed");
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message 
        || err.response?.data?.error?.message
        || "Password recovery failed. Please try again.";
      toast.error(errorMsg);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect đến Google OAuth endpoint
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div 
            className="flex items-center justify-center space-x-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate("home")}
          >
            <BookOpen className="h-8 w-8 bg-gradient-to-r from-spring to-winter bg-clip-text text-transparent" />
            <span className="text-2xl font-semibold bg-gradient-to-r from-winter to-summer bg-clip-text text-transparent">BookHaven</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(""); // Xóa thông báo lỗi khi user bắt đầu nhập
                  }}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(""); // Xóa thông báo lỗi khi user bắt đầu nhập
                  }}
                  required
                  className="h-12 pr-10"
                />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="remember" className="rounded" />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-blue-600 hover:text-blue-800"
                  onClick={handleRecoverPassword}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-summer to-winter text-white hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-12"
                  onClick={handleGoogleLogin}
                  type="button"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="h-12">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="px-0 text-blue-600 hover:text-blue-800"
                onClick={() => onNavigate("register")}
              >
                Sign up
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}