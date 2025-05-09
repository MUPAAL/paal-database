const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

// Webhook secret from environment variables
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

// Verify webhook signature
const verifyClerkWebhookSignature = (req) => {
  if (!WEBHOOK_SECRET) {
    console.warn('CLERK_WEBHOOK_SECRET is not set. Skipping signature verification.');
    return true;
  }

  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return false;
  }

  const body = JSON.stringify(req.body);
  const signaturePayload = `${svix_id}.${svix_timestamp}.${body}`;

  const signature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(signaturePayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(svix_signature)
  );
};

// Clerk webhook handler
router.post('/', express.json(), async (req, res) => {
  try {
    // Verify webhook signature
    if (!verifyClerkWebhookSignature(req)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { type, data } = req.body;

    // Handle user creation
    if (type === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = data;
      
      // Get primary email
      const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
      
      if (!primaryEmail) {
        return res.status(400).json({ error: 'No primary email found' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ clerkId: id });
      
      if (existingUser) {
        return res.status(200).json({ message: 'User already exists' });
      }

      // Create new user with default role (farmer)
      await User.create({
        clerkId: id,
        email: primaryEmail.email_address,
        firstName: first_name || 'Unknown',
        lastName: last_name || 'Unknown',
        role: 'farmer', // Default role
        profileImageUrl: image_url
      });

      return res.status(201).json({ message: 'User created successfully' });
    }

    // Handle user update
    if (type === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = data;
      
      // Get primary email
      const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
      
      if (!primaryEmail) {
        return res.status(400).json({ error: 'No primary email found' });
      }

      // Find user
      const user = await User.findOne({ clerkId: id });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user
      user.email = primaryEmail.email_address;
      user.firstName = first_name || user.firstName;
      user.lastName = last_name || user.lastName;
      user.profileImageUrl = image_url || user.profileImageUrl;
      
      await user.save();

      return res.status(200).json({ message: 'User updated successfully' });
    }

    // Handle user deletion
    if (type === 'user.deleted') {
      const { id } = data;

      // Find user
      const user = await User.findOne({ clerkId: id });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Instead of deleting, mark as inactive
      user.isActive = false;
      await user.save();

      return res.status(200).json({ message: 'User marked as inactive' });
    }

    // Default response for unhandled event types
    return res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
