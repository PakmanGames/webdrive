"user server";

import { ID, Query } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite";
import { parseStringify } from "../utils";

// 1. User enters full name and email
// 2. Check if the user already exists using the email (determines if need to create new user document)
// 3. Send OTP to user's email

// 4. This will send a secret key for creating a sessions
// 5. Create a new user document if the user is a new user
// 6. Return the user's accountId that will be used to complete the login
// 7. Verify OTP and authenticate to login

// Get the user by email if it exists
const getUserByEmail = async (email: string) => {
    const { databases } = await createAdminClient();
    const result = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, [Query.equal("email", email)]);

    return result.total > 0 ? result.documents[0] : null;
};

// Helper function to handle errors
const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
};

// Send an OTP to the user's email to verify it's actually their email
const sendEmailOTP = async ({ email }: { email: string }) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);
        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send email OTP");
    }
};

// Logic to create a new account
export const createAccount = async ({ fullName, email }: { fullName: string; email: string }) => {
    const existingUser = await getUserByEmail(email);

    // If the user already exists, we don't need to create a new user document
    const accountId = await sendEmailOTP({ email });
    if (!accountId) {
        throw new Error("Failed to send an OTP");
    }

    // If the user does not exist, create a new user document
    if (!existingUser) {
        const { databases } = await createAdminClient();

        // Create a new user document in the database
        await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.usersCollectionId, ID.unique(), {
            fullName,
            email,
            avatar: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
            accountId,
        });
    }

    return parseStringify({ accountId });
};
