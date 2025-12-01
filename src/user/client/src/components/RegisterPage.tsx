import axios from "axios";
import { useState } from "react";
import { BookOpen, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import type { PageType } from "../App";

const API_URL = import.meta.env.VITE_API_URL;

interface RegisterPageProps {
  onNavigate: (page: PageType) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    
    try {
      const response = await axios.post(`${API_URL}/auth/signup`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      
      if (response.status === 201) {
        setSuccessMessage(response.data.message || "Registration successful! Please check your email for login credentials.");
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          address: ""
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          onNavigate("login");
        }, 3000);
      }

    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("An error occurred during registration. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-600 mt-2">Join thousands of book lovers today</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Registration Successful!</h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                <p className="text-sm text-green-600 mt-2">Redirecting to login page...</p>
              </div>
            </div>
          </div>
        )}

        {/* Register Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              Enter your details below. We'll send your password to your email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  className="h-12"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="h-12"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Your password will be sent to this email
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full delivery address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                  className="min-h-[100px] resize-none"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Street, Ward, District, City, Province
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold">Auto-generated Password</p>
                    <p className="mt-1">We'll create a secure password and send it to your email. You can change it later in your account settings.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" id="terms" className="mt-1" required disabled={isLoading} />
                <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
                  I agree to the{" "}
                  <Button variant="link" className="px-0 text-blue-600 hover:text-blue-800 h-auto text-sm">
                    Terms of Service
                  </Button>{" "}
                  and{" "}
                  <Button variant="link" className="px-0 text-blue-600 hover:text-blue-800 h-auto text-sm">
                    Privacy Policy
                  </Button>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-summer to-winter text-white hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Button
                variant="link"
                className="px-0 text-blue-600 hover:text-blue-800"
                onClick={() => onNavigate("login")}
              >
                Sign in
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}