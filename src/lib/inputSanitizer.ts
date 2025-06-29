// Input sanitization utility to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags and potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  // Basic email sanitization
  return email.toLowerCase().trim().replace(/[<>]/g, '');
};

export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Keep only numbers, spaces, hyphens, and plus sign
  return phone.replace(/[^0-9\s\-+()]/g, '').trim();
};

export const validateAndSanitizeOrderData = (orderData: any) => {
  return {
    ...orderData,
    customer_name: orderData.customer_name ? sanitizeInput(orderData.customer_name) : null,
    customer_email: orderData.customer_email ? sanitizeEmail(orderData.customer_email) : null,
    customer_phone: orderData.customer_phone ? sanitizePhone(orderData.customer_phone) : null,
    delivery_address: orderData.delivery_address ? sanitizeInput(orderData.delivery_address) : null,
    special_requests: orderData.special_requests ? sanitizeInput(orderData.special_requests) : null,
  };
};
