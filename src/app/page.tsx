import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
          Project Planning & Management
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-xl">
          Streamline your workflow, manage tasks, and collaborate with your team
          all in one place.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/auth/signup">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="lg">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
