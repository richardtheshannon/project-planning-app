import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Registration Successful</CardTitle>
          <CardDescription>
            Your account has been created successfully.
            <br />
            Please wait for an administrator to activate your account.
            We will notify you by email once it's approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Return to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
