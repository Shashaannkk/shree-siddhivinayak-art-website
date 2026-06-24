const express = require('express');
const crypto = require('crypto');
const dataService = require('./dataService');
const { loginRequest, verifyOTP, authenticateAdmin } = require('./auth');
const { upload, isCloudinaryConfigured } = require('./uploadHelper');

const router = express.Router();

// Initialize Razorpay SDK if keys are available
let razorpayInstance = null;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  try {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
    console.log('💳 Razorpay Payment Gateway configured.');
  } catch (err) {
    console.error('Failed to initialize Razorpay SDK:', err);
  }
} else {
  console.log('⚠️  No Razorpay keys found. Operating in PAYMENT SIMULATION fallback mode.');
}

// -------------------------------------------------------------
// PUBLIC MURTI ENDPOINTS
// -------------------------------------------------------------

// Get all murtis with filters
router.get('/murtis', async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      size: req.query.size,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      search: req.query.search
    };
    const murtis = await dataService.getMurtis(filters);
    return res.status(200).json(murtis);
  } catch (error) {
    console.error('Error fetching murtis:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get individual murti details (increments views)
router.get('/murtis/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const murti = await dataService.getMurtiByCode(code, true);
    if (!murti) {
      return res.status(404).json({ error: 'Murti not found.' });
    }
    return res.status(200).json(murti);
  } catch (error) {
    console.error('Error fetching murti details:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// -------------------------------------------------------------
// BOOKING FLOW ENDPOINTS
// -------------------------------------------------------------

// Initiate Booking (Creates Razorpay order or Mock Payment package)
router.post('/bookings', async (req, res) => {
  const { 
    customerName, 
    customerPhone, 
    customerCity, 
    shippingType, 
    shippingDate, 
    murtiCode 
  } = req.body;

  if (!customerName || !customerPhone || !customerCity || !shippingType || !shippingDate || !murtiCode) {
    return res.status(400).json({ error: 'All booking fields are required.' });
  }

  try {
    const murti = await dataService.getMurtiByCode(murtiCode);
    if (!murti) {
      return res.status(404).json({ error: 'Murti not found.' });
    }
    if (murti.status !== 'Available') {
      return res.status(400).json({ error: `This Murti is currently ${murti.status} and cannot be booked.` });
    }

    // Double check: Create temporary booking in Pending state
    const booking = await dataService.createBooking({
      customerName,
      customerPhone,
      customerCity,
      shippingType,
      shippingDate,
      murtiCode,
      amountPaid: murti.bookingAmount,
      status: 'Pending'
    });

    // If Razorpay is configured, generate real order
    if (razorpayInstance) {
      const options = {
        amount: murti.bookingAmount * 100, // in paise
        currency: 'INR',
        receipt: booking.bookingId,
      };
      
      const order = await razorpayInstance.orders.create(options);
      return res.status(201).json({
        success: true,
        useMock: false,
        bookingId: booking.bookingId,
        orderId: order.id,
        amount: options.amount,
        currency: options.currency,
        razorpayKeyId: RAZORPAY_KEY_ID,
        murti
      });
    } else {
      // Mock payment mode
      return res.status(201).json({
        success: true,
        useMock: true,
        bookingId: booking.bookingId,
        amount: murti.bookingAmount,
        murti
      });
    }
  } catch (error) {
    console.error('Booking initiation failed:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

// Verify Payment and Finalize Booking
router.post('/bookings/verify', async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature, simulatedSuccess } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required.' });
  }

  try {
    const booking = await dataService.getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking record not found.' });
    }

    if (razorpayInstance) {
      // Verify Real Razorpay Signature
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Payment credentials missing.' });
      }

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        // Successful payment verification
        const confirmedBooking = await dataService.confirmBooking(
          bookingId, 
          razorpay_payment_id, 
          razorpay_signature
        );
        return res.status(200).json({
          success: true,
          message: 'Payment verified successfully.',
          booking: confirmedBooking
        });
      } else {
        await dataService.updateBookingStatus(bookingId, 'Cancelled');
        return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
      }
    } else {
      // Mock mode verification
      if (simulatedSuccess) {
        const mockPayId = `pay_MOCK${Date.now()}`;
        const mockSig = `sig_MOCK${Date.now()}`;
        const confirmedBooking = await dataService.confirmBooking(bookingId, mockPayId, mockSig);
        return res.status(200).json({
          success: true,
          message: 'Simulated payment completed.',
          booking: confirmedBooking
        });
      } else {
        await dataService.updateBookingStatus(bookingId, 'Cancelled');
        return res.status(400).json({ error: 'Payment simulation aborted.' });
      }
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// -------------------------------------------------------------
// ADMIN LOGIN ENDPOINTS
// -------------------------------------------------------------
router.post('/admin/login', loginRequest);
router.post('/admin/verify-otp', verifyOTP);

// -------------------------------------------------------------
// PROTECTED ADMIN ENDPOINTS
// -------------------------------------------------------------

// Add New Murti (Handles photo/video file uploads)
router.post('/admin/murtis', authenticateAdmin, upload.fields([
  { name: 'photos', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]), async (req, res) => {
  try {
    const { name, category, size, price, bookingAmount, description, code, quantity } = req.body;

    if (!name || !category || !size || !price) {
      return res.status(400).json({ error: 'Name, Category, Size, and Price are required.' });
    }

    const photoPaths = [];
    const videoPaths = [];

    // Parse uploaded files
    if (req.files) {
      const isCloud = isCloudinaryConfigured();
      
      if (req.files.photos) {
        req.files.photos.forEach(file => {
          if (isCloud) {
            photoPaths.push(file.path); // Cloudinary URL
          } else {
            // Local path serving URL
            const relativePath = file.filename;
            photoPaths.push(`/uploads/${relativePath}`);
          }
        });
      }

      if (req.files.videos) {
        req.files.videos.forEach(file => {
          if (isCloud) {
            videoPaths.push(file.path);
          } else {
            const relativePath = file.filename;
            videoPaths.push(`/uploads/${relativePath}`);
          }
        });
      }
    }

    const newMurti = await dataService.createMurti({
      name,
      category,
      size,
      price: Number(price),
      bookingAmount: bookingAmount ? Number(bookingAmount) : 1000,
      quantity: quantity ? Number(quantity) : 1,
      description: description || '',
      code: code || undefined,
      photos: photoPaths,
      videos: videoPaths,
      status: 'Available'
    });

    return res.status(201).json({
      message: 'Murti created successfully.',
      murti: newMurti
    });
  } catch (error) {
    console.error('Error creating murti:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

// Update Murti details (e.g. modify price, status, or details)
router.put('/admin/murtis/:code', authenticateAdmin, async (req, res) => {
  const { code } = req.params;
  try {
    const updated = await dataService.updateMurti(code, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Murti not found.' });
    }
    return res.status(200).json({
      message: 'Murti updated successfully.',
      murti: updated
    });
  } catch (error) {
    console.error('Error updating murti:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Delete Murti
router.delete('/admin/murtis/:code', authenticateAdmin, async (req, res) => {
  const { code } = req.params;
  try {
    const deleted = await dataService.deleteMurti(code);
    if (!deleted) {
      return res.status(404).json({ error: 'Murti not found.' });
    }
    return res.status(200).json({ message: `Murti ${code} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting murti:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Fetch all bookings list
router.get('/admin/bookings', authenticateAdmin, async (req, res) => {
  try {
    const bookings = await dataService.getBookings();
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Update booking status (Pending, Confirmed, Completed, Cancelled)
router.put('/admin/bookings/:id/status', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    const updated = await dataService.updateBookingStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    return res.status(200).json({
      message: 'Booking status updated successfully.',
      booking: updated
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Dashboard Analytics
router.get('/admin/analytics', authenticateAdmin, async (req, res) => {
  try {
    const analytics = await dataService.getAnalytics();
    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
