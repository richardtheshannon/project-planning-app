import { prisma } from "@/lib/prisma";
import UserTable from "./UserTable"; // Import the new Client Component

// This function fetches all users from the database
async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc', // Show newest users first
    }
  });
  return users;
}

// This is the main page component (Server Component)
export default async function TeamPage() {
  const users = await getUsers();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
        <p className="text-gray-600">
          A list of all the users in your application.
        </p>
      </div>

      {/* Render the UserTable client component, passing the users data as a prop */}
      <UserTable users={users} />
      
    </div>
  );
}
