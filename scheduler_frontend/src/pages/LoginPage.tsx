import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

import { authService } from '@/services/auth.service';

// ---- Schemas (match backend) ----
const userLoginSchema = z.object({
  employeeId: z.string().optional(),
  username: z.string().optional(),
}).refine(v => !!(v.employeeId || v.username), {
  message: 'Provide employee ID or username',
  path: ['employeeId']
});

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const userSignupSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  name: z.string().min(1, 'Name is required'),
  username: z.string().optional()
});

const adminSignupSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserLoginForm = z.infer<typeof userLoginSchema>;
type AdminLoginForm = z.infer<typeof adminLoginSchema>;
type UserSignupForm = z.infer<typeof userSignupSchema>;
type AdminSignupForm = z.infer<typeof adminSignupSchema>;

export const LoginPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const userLoginForm = useForm<UserLoginForm>({ resolver: zodResolver(userLoginSchema) });
  const adminLoginForm = useForm<AdminLoginForm>({ resolver: zodResolver(adminLoginSchema) });
  const userSignupForm = useForm<UserSignupForm>({ resolver: zodResolver(userSignupSchema) });
  const adminSignupForm = useForm<AdminSignupForm>({ resolver: zodResolver(adminSignupSchema) });

  // ---- Handlers ----
  const handleUserLogin = async (data: UserLoginForm) => {
    setError(''); setSubmitting(true);
    try {
      await authService.userLogin({
        employeeId: data.employeeId || undefined,
        username: data.username || undefined
      });
      toast({ title: "Logged in ✅" });
      navigate('/resources');
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async (data: AdminLoginForm) => {
    setError(''); setSubmitting(true);
    try {
      await authService.adminLogin({ username: data.username, password: data.password });
      toast({ title: "Admin logged in ✅" });
      navigate('/admin');
    } catch (e: any) {
      setError(e?.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserSignup = async (data: UserSignupForm) => {
    setError(''); setSubmitting(true);
    try {
      await authService.userSignup({
        name: data.name,
        employeeId: data.employeeId,
        username: data.username || undefined
      });
      toast({ title: "Account created successfully!" });
      navigate('/resources');
    } catch (e: any) {
      setError(e?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminSignup = async (data: AdminSignupForm) => {
    setError(''); setSubmitting(true);
    try {
      await authService.adminSignup({
        name: 'Admin', // or add a field if you want to collect name
        username: data.username,
        password: data.password
      });
      toast({ title: "Admin account created successfully!" });
      navigate('/admin');
    } catch (e: any) {
      setError(e?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Resource Booking System</CardTitle>
          <CardDescription>Sign in or create an account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login'|'signup')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Tabs value={userType} onValueChange={(v) => setUserType(v as 'user'|'admin')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="user">User</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="user" className="space-y-4">
                  <form onSubmit={userLoginForm.handleSubmit(handleUserLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        placeholder="e.g. E1001"
                        {...userLoginForm.register('employeeId')}
                        className={userLoginForm.formState.errors.employeeId ? 'border-destructive' : ''}
                      />
                      {userLoginForm.formState.errors.employeeId && (
                        <p className="text-sm text-destructive">{userLoginForm.formState.errors.employeeId.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username (optional)</Label>
                      <Input
                        id="username"
                        placeholder="e.g. alice"
                        {...userLoginForm.register('username')}
                        className={userLoginForm.formState.errors.username ? 'border-destructive' : ''}
                      />
                      {userLoginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{userLoginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <Button disabled={submitting} type="submit" className="w-full">
                      {submitting ? 'Signing in…' : 'Login as User'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="admin" className="space-y-4">
                  <form onSubmit={adminLoginForm.handleSubmit(handleAdminLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-username">Username</Label>
                      <Input
                        id="admin-username"
                        {...adminLoginForm.register('username')}
                        className={adminLoginForm.formState.errors.username ? 'border-destructive' : ''}
                      />
                      {adminLoginForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{adminLoginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-password">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        {...adminLoginForm.register('password')}
                        className={adminLoginForm.formState.errors.password ? 'border-destructive' : ''}
                      />
                      {adminLoginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{adminLoginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button disabled={submitting} type="submit" className="w-full">
                      {submitting ? 'Signing in…' : 'Login as Admin'}
                    </Button>
                    <p className="text-sm text-muted-foreground text-center">
                      Default credentials: admin / admin
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <Tabs value={userType} onValueChange={(v) => setUserType(v as 'user'|'admin')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="user">User</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="user" className="space-y-4">
                  <form onSubmit={userSignupForm.handleSubmit(handleUserSignup)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signupEmployeeId">Employee ID</Label>
                      <Input
                        id="signupEmployeeId"
                        {...userSignupForm.register('employeeId')}
                        className={userSignupForm.formState.errors.employeeId ? 'border-destructive' : ''}
                      />
                      {userSignupForm.formState.errors.employeeId && (
                        <p className="text-sm text-destructive">{userSignupForm.formState.errors.employeeId.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupName">Name</Label>
                      <Input
                        id="signupName"
                        {...userSignupForm.register('name')}
                        className={userSignupForm.formState.errors.name ? 'border-destructive' : ''}
                      />
                      {userSignupForm.formState.errors.name && (
                        <p className="text-sm text-destructive">{userSignupForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupUsername">Username (optional)</Label>
                      <Input
                        id="signupUsername"
                        {...userSignupForm.register('username')}
                        className={userSignupForm.formState.errors.username ? 'border-destructive' : ''}
                      />
                      {userSignupForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{userSignupForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <Button disabled={submitting} type="submit" className="w-full">
                      {submitting ? 'Creating…' : 'Create User Account'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="admin" className="space-y-4">
                  <form onSubmit={adminSignupForm.handleSubmit(handleAdminSignup)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signupUsername">Username</Label>
                      <Input
                        id="signupUsername"
                        {...adminSignupForm.register('username')}
                        className={adminSignupForm.formState.errors.username ? 'border-destructive' : ''}
                      />
                      {adminSignupForm.formState.errors.username && (
                        <p className="text-sm text-destructive">{adminSignupForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword">Password</Label>
                      <Input
                        id="signupPassword"
                        type="password"
                        {...adminSignupForm.register('password')}
                        className={adminSignupForm.formState.errors.password ? 'border-destructive' : ''}
                      />
                      {adminSignupForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{adminSignupForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...adminSignupForm.register('confirmPassword')}
                        className={adminSignupForm.formState.errors.confirmPassword ? 'border-destructive' : ''}
                      />
                      {adminSignupForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">{adminSignupForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                    <Button disabled={submitting} type="submit" className="w-full">
                      {submitting ? 'Creating…' : 'Create Admin Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};