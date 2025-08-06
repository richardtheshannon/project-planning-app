// src/app/dashboard/team/AddUserForm.tsx

'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserRole } from '@prisma/client';

// This component receives a function to call after a user is successfully added.
// This allows the parent component (the user list) to refresh itself.
interface AddUserFormProps {
  onUserAdded: () => void;
}

export default function AddUserForm({ onUserAdded }: AddUserFormProps) {
  // State for each form field
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER); // Default role is USER

  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handles the form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Send a POST request to our API endpoint
      await axios.post('/api/users', {
        name,
        email,
        password,
        role,
      });

      // Show a success notification
      toast.success('New member added successfully!');

      // Reset the form fields
      setName('');
      setEmail('');
      setPassword('');
      setRole(UserRole.USER);
      
      // Notify the parent component that a user was added
      onUserAdded();

    } catch (err: any) {
      // If there's an error, display it
      const errorMessage = err.response?.data?.message || err.response?.data || 'An unexpected error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      // Stop the loading indicator
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-12 p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Member</h3>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Manually add a new user to the system. They will be set as active by default.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Full Name Input */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jane Doe"
            required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., jane.doe@example.com"
            required
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a secure password"
            required
            minLength={8}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Role Select Dropdown */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {/* CORRECTED: Use Object.keys for a type-safe iteration over the enum */}
            {Object.keys(UserRole).map((roleKey) => (
              <option key={roleKey} value={roleKey}>
                {/* Capitalize the first letter, lowercase the rest for display */}
                {roleKey.charAt(0) + roleKey.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding Member...' : 'Add Member'}
          </button>
        </div>

        {/* Display Error Message */}
        {error && (
          <div className="text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
