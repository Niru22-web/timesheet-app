/**
 * Reusable message utility functions for consistent UX across the app
 */

export const getErrorMessage = (error: any): string => {
  // Handle different error structures
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return "Something went wrong. Please try again.";
};

export const getSuccessMessage = (action: string): string => {
  const successMessages: Record<string, string> = {
    login: "Login successful! Welcome back",
    logout: "Logged out successfully",
    profile: "Profile updated successfully",
    photo: "Profile photo updated successfully",
    password: "Password changed successfully",
    project: "Project created successfully",
    employee: "Employee updated successfully",
    timesheet: "Timesheet submitted successfully",
    delete: "Item deleted successfully",
    save: "Changes saved successfully",
    upload: "File uploaded successfully"
  };
  
  return successMessages[action] || "Operation completed successfully";
};

export const getLoadingMessage = (action: string): string => {
  const loadingMessages: Record<string, string> = {
    login: "Logging in...",
    logout: "Logging out...",
    profile: "Updating profile...",
    photo: "Uploading photo...",
    password: "Changing password...",
    project: "Creating project...",
    employee: "Updating employee...",
    timesheet: "Submitting timesheet...",
    delete: "Deleting item...",
    save: "Saving changes...",
    upload: "Uploading file...",
    loading: "Loading...",
    fetching: "Fetching data..."
  };
  
  return loadingMessages[action] || "Processing...";
};

// Standard error messages for common scenarios
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  NETWORK_ERROR: "Network error. Please check your connection and try again",
  SESSION_EXPIRED: "Session expired. Please login again",
  ACCESS_DENIED: "Access denied. You don't have permission to perform this action",
  NOT_FOUND: "Requested resource not found",
  SERVER_ERROR: "Server error. Please try again later",
  VALIDATION_ERROR: "Please check your input and try again",
  FILE_TOO_LARGE: "File size must be less than 5MB",
  INVALID_FILE_TYPE: "Only JPEG, JPG, and PNG files are allowed",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  WEAK_PASSWORD: "Password must be at least 8 characters long",
  PASSWORDS_DONT_MATCH: "New passwords do not match"
} as const;

// Standard success messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Login successful! Welcome back",
  LOGOUT: "Logged out successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  PHOTO_UPDATED: "Profile photo updated successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  PROJECT_CREATED: "Project created successfully",
  EMPLOYEE_UPDATED: "Employee updated successfully",
  TIMESHEET_SUBMITTED: "Timesheet submitted successfully",
  ITEM_DELETED: "Item deleted successfully",
  CHANGES_SAVED: "Changes saved successfully",
  FILE_UPLOADED: "File uploaded successfully",
  REGISTRATION_COMPLETE: "Registration completed successfully",
  EMAIL_SENT: "Email sent successfully"
} as const;
