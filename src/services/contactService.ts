import { toast } from "sonner";

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Validates email format using regex
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that all required form fields are filled
 */
export const validateContactForm = (formData: ContactFormData): boolean => {
  const { firstName, lastName, email, subject, message } = formData;

  if (!firstName || !lastName || !email || !subject || !message) {
    toast.error("Please fill in all fields");
    return false;
  }

  if (!validateEmail(email)) {
    toast.error("Please enter a valid email address");
    return false;
  }

  return true;
};

/**
 * Creates a mailto link with formatted contact form data
 */
export const createMailtoLink = (formData: ContactFormData): string => {
  const { firstName, lastName, email, subject, message } = formData;

  const emailBody = `Name: ${firstName} ${lastName}
Email: ${email}

Message:
${message}`;

  const mailtoLink = `mailto:himanshuraj223422@gmail.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(emailBody)}`;

  return mailtoLink;
};

/**
 * Handles contact form submission by opening the user's default email client
 */
export const submitContactForm = async (
  formData: ContactFormData
): Promise<boolean> => {
  try {
    // Validate form data
    if (!validateContactForm(formData)) {
      return false;
    }

    // Create and open mailto link
    const mailtoLink = createMailtoLink(formData);
    window.location.href = mailtoLink;

    // Show success message
    toast.success("Email client opened!", {
      description: "Your default email client should open with the message",
    });

    return true;
  } catch (error) {
    console.error("Contact form submission error:", error);
    toast.error("Failed to open email client", {
      description:
        "Please try emailing us directly at himanshuraj223422@gmail.com",
    });
    return false;
  }
};

/**
 * Creates an empty contact form object
 */
export const createEmptyContactForm = (): ContactFormData => {
  return {
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  };
};
