# Security Specification - Karachi Estates

## Data Invariants
1. A property must have a title, price, location, and type.
2. A lead is associated with a userId or is created by the system.
3. A booking must reference an existing propertyId.
4. Users can only read/write their own lead profiles and bookings.
5. Admins can read all data and update property listings.

## The Dirty Dozen Payloads (Targeting Rejection)
1. Creating a property with a 2MB title string.
2. Updating a property price to a negative value.
3. Creating a booking for a non-existent propertyId.
4. Accessing another user's lead profile.
5. Deleting a property as a non-admin.
6. Spoofing `isSerious: true` as a regular user (should only be set by chatbot logic or admin).
7. Injecting non-alphanumeric characters into document IDs.
8. Updating `createdAt` timestamp.
9. Listing all leads as a regular user.
10. Creating a booking with a past date (though rules might not check date logic perfectly, it should check type).
11. Sending a lead update with extra "ghost fields" like `isAdmin: true`.
12. Requesting properties without filters to scrape the whole DB (if rules enforce query limits).

## Test Runner Plan
- Test that non-authenticated users can only READ properties.
- Test that authenticated users can CREATE their own lead and bookings.
- Test that admins can do everything.
