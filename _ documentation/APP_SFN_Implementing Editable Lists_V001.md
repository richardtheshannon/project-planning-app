# **Technical Guide: Implementing Editable Lists**

Document Version: 1.0  
Last Updated: August 8, 2025  
This document outlines the successful, repeatable pattern for adding "edit" and "delete" functionality to a data table in this application. This pattern has been successfully applied to Invoices, Expenses, and Subscriptions.

## **The Three-Part Pattern**

The core logic is broken down into three distinct, cooperative parts:

1. **The API Route**: A dedicated, dynamic API route that handles all database operations for a *single* item (e.g., /api/financials/expenses/\[id\]).  
2. **The Dialog Component**: A "use client" React component that contains the form for editing or deleting an item (e.g., EditExpenseDialog.tsx).  
3. **The Page Integration**: The main page that displays the list of items and manages the state for opening and closing the dialog (e.g., expenses/page.tsx).

## **1\. The API Route (.../\[id\]/route.ts)**

This is the backend foundation. Its only job is to talk to the database.

### **Key Responsibilities:**

* **GET Handler**: Fetches a single item from the database using its unique id.  
* **PATCH Handler**: Updates a single item. It receives new data in the request body, validates it using a Zod schema, and applies the update.  
* **DELETE Handler**: Removes a single item from the database.  
* **Security**: **Crucially**, every handler must first get the user's session and include a where: { userId: session.user.id } clause in the Prisma query. This is a non-negotiable security measure to ensure users can only modify their own data.

### **Example (/api/financials/subscriptions/\[id\]/route.ts)**

// Zod schema for validating incoming update data  
const subscriptionUpdateSchema \= z.object({  
  name: z.string().optional(),  
  amount: z.number().optional(),  
  // ... other fields  
});

// The PATCH handler is a great example of the pattern  
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {  
  // 1\. Authenticate  
  const session \= await getServerSession(authOptions);  
  if (\!session?.user?.id) {  
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });  
  }

  // 2\. Validate incoming data  
  const body \= await request.json();  
  const validation \= subscriptionUpdateSchema.safeParse(body);  
  if (\!validation.success) {  
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });  
  }

  // 3\. Perform the secure database operation  
  try {  
    const updatedSubscription \= await prisma.subscription.update({  
      where: {  
        id: params.id,  
        userId: session.user.id, // \<-- The critical security check  
      },  
      data: validation.data,  
    });  
    return NextResponse.json(updatedSubscription);  
  } catch (error) {  
    // ... error handling  
  }  
}

## **2\. The Dialog Component (Edit...Dialog.tsx)**

This is the user-facing part of the feature. It's where we solved the most complex bugs.

### **Key Responsibilities & Logic:**

* **Props**: It must accept isOpen, onOpenChange, the item to be edited, and an on...Updated callback function to trigger a data refresh on the parent page.  
* **Form Management**: It uses react-hook-form and zodResolver to manage the form state and validation.  
* **Data Population**: An useEffect hook watches for changes to the item prop. When an item is passed in, the hook uses form.reset() to populate the form fields with that item's data.  
* **Submission Handling**: An onSubmit function sends a PATCH request to the API route.  
* **Deletion Handling**: A handleDelete function sends a DELETE request and includes a confirm() dialog for safety.

### **Solving the react-hook-form and Zod Errors**

We discovered a very specific pattern is required to prevent TypeScript errors between these libraries:

1. **Use z.number() in the Schema**: In your Zod schema, use z.number() for numeric fields, *not* z.coerce.number(). This simplifies the type that Zod expects.  
2. **Use parseFloat() in the onChange Handler**: Because an \<Input type="number" /\> still provides its value as a string, you must explicitly convert it back to a number in the onChange event of the FormField.  
3. **Use FieldValues in onSubmit**: The onSubmit handler should accept the generic FieldValues type from react-hook-form. Inside this function, you manually construct the payload for your API call, ensuring all data types are correct (e.g., using parseFloat() again on the amount).

### **Example (EditExpenseDialog.tsx)**

// ... imports

// 1\. Zod schema uses z.number()  
const formSchema \= z.object({  
  amount: z.number().min(0.01, "Amount must be a positive number."),  
  // ... other fields  
});

export default function EditExpenseDialog({ expense, ...props }: Props) {  
  const form \= useForm\<ExpenseFormValues\>({  
    resolver: zodResolver(formSchema),  
    // ...  
  });

  // 3\. onSubmit uses the generic FieldValues type  
  const onSubmit \= async (values: FieldValues) \=\> {  
    if (\!expense) return;

    // Manually construct the payload to ensure correct types  
    const bodyPayload \= {  
        ...values,  
        amount: parseFloat(values.amount), // Ensure it's a number  
    };

    // ... fetch logic  
  };

  return (  
    // ...  
    \<FormField  
      control={form.control}  
      name="amount"  
      render={({ field }) \=\> (  
        \<FormItem\>  
          \<FormControl\>  
            {/\* 2\. The onChange handler manually converts the value to a number \*/}  
            \<Input  
              type="number"  
              {...field}  
              onChange={(e) \=\> field.onChange(parseFloat(e.target.value) || 0)}  
            /\>  
          \</FormControl\>  
        \</FormItem\>  
      )}  
    /\>  
    // ...  
  );  
}

## **3\. The Page Integration (.../page.tsx)**

This is the final step that connects everything.

### **Key Responsibilities:**

* **State Management**: The page holds state for the list of items (expenses, subscriptions, etc.), the currently selectedItem, and the dialog's visibility (is...EditDialogOpen).  
* **Data Fetching**: It uses a useCallback function (fetch...) to get the list of items from the main API route (e.g., /api/financials/expenses).  
* **Selection Handler**: A handler function (handle...Select) takes an item from the list, sets it as the selectedItem in state, and sets the dialog's visibility state to true.  
* **Component Rendering**: It passes the selection handler to the list component and renders the Edit...Dialog, passing it the selectedItem, the visibility state, and the fetch... function as the update callback.

### **Example (expenses/page.tsx)**

export default function ExpensesPage() {  
  // 1\. State Management  
  const \[subscriptions, setSubscriptions\] \= useState\<Subscription\[\]\>(\[\]);  
  const \[selectedSubscription, setSelectedSubscription\] \= useState\<Subscription | null\>(null);  
  const \[isSubscriptionEditDialogOpen, setIsSubscriptionEditDialogOpen\] \= useState(false);

  // 2\. Data Fetching (simplified)  
  const fetchSubscriptions \= useCallback(async () \=\> {  
    // ... fetch logic  
  }, \[\]);

  // 3\. Selection Handler  
  const handleSubscriptionSelect \= (subscription: Subscription) \=\> {  
    setSelectedSubscription(subscription);  
    setIsSubscriptionEditDialogOpen(true);  
  };

  useEffect(() \=\> {  
    fetchSubscriptions();  
  }, \[fetchSubscriptions\]);

  return (  
    \<div className="space-y-8"\>  
      {/\* ... \*/}  
      \<Card\>  
        \<CardContent\>  
          {/\* 4\. Pass the handler to the list \*/}  
          \<SubscriptionList  
            subscriptions={subscriptions}  
            onSubscriptionSelect={handleSubscriptionSelect}  
          /\>  
        \</CardContent\>  
      \</Card\>

      {/\* 4\. Render the dialog with the correct props \*/}  
      \<EditSubscriptionDialog  
        subscription={selectedSubscription}  
        isOpen={isSubscriptionEditDialogOpen}  
        onOpenChange={setIsSubscriptionEditDialogOpen}  
        onSubscriptionUpdated={fetchSubscriptions}  
      /\>  
    \</div\>  
  );  
}  
