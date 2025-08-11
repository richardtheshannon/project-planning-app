import dynamic from 'next/dynamic';

// This new component is dynamically imported with server-side rendering (ssr) turned off.
// This is a robust way to ensure the component and its data fetching only run in the browser,
// which will prevent the build process from failing on Railway.
const ExpensesView = dynamic(
  () => import('@/components/financials/ExpensesView'),
  { 
    ssr: false,
    loading: () => <p className="p-8 text-center text-muted-foreground">Loading Financials...</p>
  }
);

export default function ExpensesPage() {
  return <ExpensesView />;
}
