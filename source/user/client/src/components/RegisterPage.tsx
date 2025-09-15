import { useState } from "react";
import { BookOpen, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    return { minLength, hasNumber, hasLetter };
  };

  const passwordValidation = validatePassword(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      onNavigate("home");
    }, 1000);
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

        {/* Register Card */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              Create your account to start discovering amazing books
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
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
                
                {/* Password Requirements */}
                {formData.password && (
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center space-x-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <Check className={`h-3 w-3 ${passwordValidation.minLength ? 'opacity-100' : 'opacity-30'}`} />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      <Check className={`h-3 w-3 ${passwordValidation.hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                      <span>Contains a number</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-500'}`}>
                      <Check className={`h-3 w-3 ${passwordValidation.hasLetter ? 'opacity-100' : 'opacity-30'}`} />
                      <span>Contains a letter</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="h-12 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {formData.confirmPassword && (
                  <div className={`flex items-center space-x-2 text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                    <Check className={`h-3 w-3 ${passwordsMatch ? 'opacity-100' : 'opacity-30'}`} />
                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" id="terms" className="mt-1" required />
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
                disabled={isLoading || !passwordsMatch || !Object.values(passwordValidation).every(Boolean)}
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