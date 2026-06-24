const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { connectDB, isFallbackMode } = require('./db');
const { Murti, Booking, Admin } = require('./models');

const FALLBACK_FILE = path.join(__dirname, 'db_fallback.json');

// Mappings for Category -> Code Prefix
const CATEGORY_PREFIXES = {
  'Ganpati': 'GAN',
  'Navratri': 'NAV',
  'Krishna Theme': 'KRI',
  'Mavla Theme': 'MAV',
  'Royal Theme': 'ROY',
  'Narasimha Theme': 'NAR'
};

const getPrefix = (category) => {
  return CATEGORY_PREFIXES[category] || 'MUR';
};

// Seed Data
const seedMurtis = [
  {
    code: 'GAN-001',
    name: 'Royal Blue Ganpati',
    category: 'Ganpati',
    size: '3.5 Ft',
    price: 15000,
    bookingAmount: 1000,
    status: 'Available',
    photos: ['https://images.unsplash.com/photo-1609252509102-ee7026b2161f?w=800&auto=format&fit=crop'],
    videos: [],
    description: 'Beautiful Royal Blue Shringar Ganpati Idol with intricate hand-painted golden details. Perfect for home or society celebrations.',
    views: 124,
    createdAt: new Date(Date.now() - 500000000)
  },
  {
    code: 'GAN-002',
    name: 'Lalbaugcha Raja Replica',
    category: 'Ganpati',
    size: '4.0 Ft',
    price: 18500,
    bookingAmount: 1000,
    status: 'Reserved',
    photos: ['https://images.unsplash.com/photo-1567591905632-9a595a86e374?w=800&auto=format&fit=crop'],
    videos: [],
    description: 'Iconic Lalbaugcha Raja style pose, hand-sculpted in premium clay with a majestic red throne.',
    views: 450,
    createdAt: new Date(Date.now() - 400000000)
  },
  {
    code: 'GAN-003',
    name: 'Dagadusheth Halwai Ganpati',
    category: 'Ganpati',
    size: '5.0 Ft',
    price: 28000,
    bookingAmount: 2000,
    status: 'Sold',
    photos: ['https://images.unsplash.com/photo-1628134710188-79b88cf466fb?w=800&auto=format&fit=crop'],
    videos: [],
    description: 'Stunning Dagadusheth Halwai replication adorned with heavy replica gold ornaments and crown.',
    views: 612,
    createdAt: new Date(Date.now() - 300000000)
  },
  {
    code: 'NAV-001',
    name: 'Durga Murti Saree Style',
    category: 'Navratri',
    size: '4.5 Ft',
    price: 22000,
    bookingAmount: 1500,
    status: 'Available',
    photos: ['https://images.unsplash.com/photo-1602167098485-618779b5c3ff?w=800&auto=format&fit=crop'],
    videos: [],
    description: 'Vibrant hand-draped saree style Durga Devi Idol, featuring high-quality finishes and facial expressions.',
    views: 89,
    createdAt: new Date(Date.now() - 250000000)
  },
  {
    code: 'KRI-001',
    name: 'Makhan Chor Krishna',
    category: 'Krishna Theme',
    size: '2.5 Ft',
    price: 12000,
    bookingAmount: 1000,
    status: 'Available',
    photos: ['https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop'],
    videos: [],
    description: 'Bal Krishna stealing butter from a pot. Features glossy marble finishing and handmade peacock feathers.',
    views: 78,
    createdAt: new Date(Date.now() - 200000000)
  },
  {
    code: 'MAV-001',
    name: 'Shivaji Maharaj Theme Ganpati',
    category: 'Mavla Theme',
    size: '3.0 Ft',
    price: 16000,
    bookingAmount: 1000,
    status: 'Available',
    photos: ['https://images.unsplash.com/photo-1609252509102-ee7026b2161f?w=800&auto=format&fit=crop'],
    videos: [],
    description: 'Ganpati sitting on a fort replica, wearing a traditional Maratha Pheta (turban).',
    views: 145,
    createdAt: new Date(Date.now() - 150000000)
  },
  {
    code: 'ROY-001',
    name: 'Peshwa Style Royal Ganpati',
    category: 'Royal Theme',
    size: '4.5 Ft',
    price: 24000,
    bookingAmount: 1500,
    status: 'Available',
    photos: ['https://images.unsplash.com/photo-1567591905632-9a595a86e374?w=800&auto=format&fit=crop'],
    videos: [],
    description: 'Royal court setup with a marble-textured Ganesh Idol resting against custom bolsters.',
    views: 180,
    createdAt: new Date(Date.now() - 100000000)
  },
  {
    code: 'NAR-001',
    name: 'Ugra Narasimha Murti',
    category: 'Narasimha Theme',
    size: '3.5 Ft',
    price: 19000,
    bookingAmount: 1000,
    status: 'Available',
    photos: ['https://images.unsplash.com/photo-1602167098485-618779b5c3ff?w=800&auto=format&fit=crop'],
    videos: [],
    description: 'Intense and powerful carving of Lord Narasimha emerging from the pillar, painted with high-contrast acrylics.',
    views: 95,
    createdAt: new Date(Date.now() - 50000000)
  }
];

const seedBookings = [
  {
    bookingId: 'BK-1001',
    customerName: 'Shashank Poojari',
    customerPhone: '9876543210',
    customerCity: 'Mumbai',
    shippingType: 'Local Delivery',
    shippingDate: new Date(Date.now() + 864000000), // 10 days later
    murtiCode: 'GAN-002',
    amountPaid: 1000,
    remainingAmount: 17500,
    paymentId: 'pay_MOCK123456789',
    signature: 'sig_MOCK123456789',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 400000000)
  },
  {
    bookingId: 'BK-1002',
    customerName: 'Rahul Sharma',
    customerPhone: '9123456789',
    customerCity: 'Pune',
    shippingType: 'Self Pickup',
    shippingDate: new Date(Date.now() + 432000000), // 5 days later
    murtiCode: 'GAN-003',
    amountPaid: 28000, // Fully paid
    remainingAmount: 0,
    paymentId: 'pay_MOCK987654321',
    signature: 'sig_MOCK987654321',
    status: 'Completed',
    createdAt: new Date(Date.now() - 300000000)
  }
];

// Helper to read JSON file
const readJSONFile = () => {
  if (!fs.existsSync(FALLBACK_FILE)) {
    const defaultData = {
      murtis: seedMurtis,
      bookings: seedBookings,
      admins: []
    };
    // Sync default admin password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin123', salt);
    defaultData.admins.push({
      email: 'admin@siddhivinayak.com',
      password: hashedPassword,
      otpSecret: '',
      otpExpires: null
    });
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const content = fs.readFileSync(FALLBACK_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading JSON fallback database:', err);
    return { murtis: [], bookings: [], admins: [] };
  }
};

// Helper to write JSON file
const writeJSONFile = (data) => {
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

const dataService = {
  async init() {
    await connectDB();

    if (!isFallbackMode()) {
      // Seed MongoDB if empty
      const murtiCount = await Murti.countDocuments();
      if (murtiCount === 0) {
        await Murti.insertMany(seedMurtis);
        console.log('🌱 Seeded Murtis in MongoDB.');
      }
      
      const bookingCount = await Booking.countDocuments();
      if (bookingCount === 0) {
        await Booking.insertMany(seedBookings);
        console.log('🌱 Seeded Bookings in MongoDB.');
      }

      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await Admin.create({
          email: 'admin@siddhivinayak.com',
          password: hashedPassword
        });
        console.log('🌱 Seeded Admin in MongoDB (admin@siddhivinayak.com / admin123).');
      }
    } else {
      // Ensure local JSON file is seeded
      readJSONFile();
      console.log(`🌱 Offline Fallback JSON DB loaded from: ${FALLBACK_FILE}`);
    }
  },

  // Generate Unique Murti Code
  async generateMurtiCode(category) {
    const prefix = getPrefix(category);
    
    if (!isFallbackMode()) {
      // Fetch murtis with this prefix
      const count = await Murti.countDocuments({ code: new RegExp(`^${prefix}-\\d+$`) });
      // Find the highest sequence number in case of deletions or manual codes
      const murtis = await Murti.find({ code: new RegExp(`^${prefix}-\\d+$`) }, { code: 1 });
      let maxNum = 0;
      murtis.forEach(m => {
        const numPart = parseInt(m.code.split('-')[1], 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      });
      const newNum = maxNum + 1;
      return `${prefix}-${String(newNum).padStart(3, '0')}`;
    } else {
      const data = readJSONFile();
      const prefixRegex = new RegExp(`^${prefix}-\\d+$`);
      let maxNum = 0;
      data.murtis.forEach(m => {
        if (prefixRegex.test(m.code)) {
          const numPart = parseInt(m.code.split('-')[1], 10);
          if (!isNaN(numPart) && numPart > maxNum) {
            maxNum = numPart;
          }
        }
      });
      const newNum = maxNum + 1;
      return `${prefix}-${String(newNum).padStart(3, '0')}`;
    }
  },

  // Murtis CRUD
  async getMurtis(filters = {}) {
    const { category, size, minPrice, maxPrice, status, search } = filters;

    if (!isFallbackMode()) {
      let query = {};
      if (category) query.category = category;
      if (status) query.status = status;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      if (size) query.size = size;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      return await Murti.find(query).sort({ createdAt: -1 });
    } else {
      const data = readJSONFile();
      let results = [...data.murtis];

      if (category) results = results.filter(m => m.category === category);
      if (status) results = results.filter(m => m.status === status);
      if (size) results = results.filter(m => m.size === size);
      if (minPrice) results = results.filter(m => m.price >= Number(minPrice));
      if (maxPrice) results = results.filter(m => m.price <= Number(maxPrice));
      if (search) {
        const s = search.toLowerCase();
        results = results.filter(m => 
          m.name.toLowerCase().includes(s) || 
          m.code.toLowerCase().includes(s) || 
          (m.description && m.description.toLowerCase().includes(s))
        );
      }
      
      // Sort newest first
      return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getMurtiByCode(code, incrementViews = false) {
    if (!isFallbackMode()) {
      if (incrementViews) {
        return await Murti.findOneAndUpdate({ code }, { $inc: { views: 1 } }, { new: true });
      }
      return await Murti.findOne({ code });
    } else {
      const data = readJSONFile();
      const index = data.murtis.findIndex(m => m.code === code);
      if (index === -1) return null;
      if (incrementViews) {
        data.murtis[index].views = (data.murtis[index].views || 0) + 1;
        writeJSONFile(data);
      }
      return data.murtis[index];
    }
  },

  async createMurti(murtiData) {
    // Generate code if not supplied
    if (!murtiData.code) {
      murtiData.code = await this.generateMurtiCode(murtiData.category);
    }
    
    // Check uniqueness
    const existing = await this.getMurtiByCode(murtiData.code);
    if (existing) {
      throw new Error(`Murti code ${murtiData.code} already exists.`);
    }

    if (!isFallbackMode()) {
      const newMurti = new Murti(murtiData);
      return await newMurti.save();
    } else {
      const data = readJSONFile();
      const record = {
        ...murtiData,
        views: 0,
        createdAt: new Date().toISOString()
      };
      data.murtis.push(record);
      writeJSONFile(data);
      return record;
    }
  },

  async updateMurti(code, updates) {
    if (!isFallbackMode()) {
      return await Murti.findOneAndUpdate({ code }, { $set: updates }, { new: true });
    } else {
      const data = readJSONFile();
      const index = data.murtis.findIndex(m => m.code === code);
      if (index === -1) return null;
      
      data.murtis[index] = {
        ...data.murtis[index],
        ...updates
      };
      writeJSONFile(data);
      return data.murtis[index];
    }
  },

  async deleteMurti(code) {
    if (!isFallbackMode()) {
      return await Murti.findOneAndDelete({ code });
    } else {
      const data = readJSONFile();
      const initialLength = data.murtis.length;
      data.murtis = data.murtis.filter(m => m.code !== code);
      if (data.murtis.length === initialLength) return null;
      writeJSONFile(data);
      return { code };
    }
  },

  // Bookings CRUD
  async getBookings() {
    if (!isFallbackMode()) {
      return await Booking.find().sort({ createdAt: -1 });
    } else {
      const data = readJSONFile();
      return [...data.bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getBookingById(bookingId) {
    if (!isFallbackMode()) {
      return await Booking.findOne({ bookingId });
    } else {
      const data = readJSONFile();
      return data.bookings.find(b => b.bookingId === bookingId) || null;
    }
  },

  async createBooking(bookingData) {
    // Check if Murti is still available
    const murti = await this.getMurtiByCode(bookingData.murtiCode);
    if (!murti) {
      throw new Error(`Murti code ${bookingData.murtiCode} not found.`);
    }
    const currentQty = murti.quantity !== undefined ? murti.quantity : 1;
    if (currentQty <= 0 || murti.status === 'Sold' || murti.status === 'Out Of Stock') {
      throw new Error(`Murti ${bookingData.murtiCode} is no longer available.`);
    }

    // Auto-generate booking ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingId = `BK-${randomSuffix}`;

    const remainingAmount = murti.price - bookingData.amountPaid;

    const newBooking = {
      bookingId,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerCity: bookingData.customerCity,
      shippingType: bookingData.shippingType,
      shippingDate: bookingData.shippingDate,
      murtiCode: bookingData.murtiCode,
      amountPaid: bookingData.amountPaid,
      remainingAmount,
      paymentId: bookingData.paymentId || '',
      signature: bookingData.signature || '',
      status: bookingData.status || 'Pending',
      createdAt: new Date().toISOString()
    };

    if (!isFallbackMode()) {
      const record = new Booking(newBooking);
      const saved = await record.save();
      
      // Update Murti Status to Reserved immediately as a hold or permanent reserve
      if (saved.status === 'Confirmed' || saved.status === 'Completed') {
        await this.updateMurti(bookingData.murtiCode, { status: 'Reserved' });
      }
      return saved;
    } else {
      const data = readJSONFile();
      data.bookings.push(newBooking);
      
      // If confirmed, reserve the murti
      if (newBooking.status === 'Confirmed' || newBooking.status === 'Completed') {
        const mIndex = data.murtis.findIndex(m => m.code === bookingData.murtiCode);
        if (mIndex !== -1) {
          data.murtis[mIndex].status = 'Reserved';
        }
      }
      writeJSONFile(data);
      return newBooking;
    }
  },

  async confirmBooking(bookingId, paymentId, signature) {
    if (!isFallbackMode()) {
      const booking = await Booking.findOneAndUpdate(
        { bookingId },
        { $set: { paymentId, signature, status: 'Confirmed' } },
        { new: true }
      );
      if (booking) {
        const murti = await Murti.findOne({ code: booking.murtiCode });
        if (murti) {
          const nextQty = Math.max(0, (murti.quantity || 1) - 1);
          const nextStatus = nextQty === 0 ? 'Sold' : 'Available';
          await Murti.findOneAndUpdate({ code: booking.murtiCode }, { $set: { quantity: nextQty, status: nextStatus } });
        }
      }
      return booking;
    } else {
      const data = readJSONFile();
      const bIndex = data.bookings.findIndex(b => b.bookingId === bookingId);
      if (bIndex === -1) return null;

      data.bookings[bIndex].paymentId = paymentId;
      data.bookings[bIndex].signature = signature;
      data.bookings[bIndex].status = 'Confirmed';

      const mCode = data.bookings[bIndex].murtiCode;
      const mIndex = data.murtis.findIndex(m => m.code === mCode);
      if (mIndex !== -1) {
        const currentQty = data.murtis[mIndex].quantity !== undefined ? data.murtis[mIndex].quantity : 1;
        const nextQty = Math.max(0, currentQty - 1);
        data.murtis[mIndex].quantity = nextQty;
        data.murtis[mIndex].status = nextQty === 0 ? 'Sold' : 'Available';
      }

      writeJSONFile(data);
      return data.bookings[bIndex];
    }
  },

  async updateBookingStatus(bookingId, status) {
    if (!isFallbackMode()) {
      const booking = await Booking.findOneAndUpdate(
        { bookingId },
        { $set: { status } },
        { new: true }
      );
      if (booking) {
        if (status === 'Cancelled') {
          const murti = await Murti.findOne({ code: booking.murtiCode });
          if (murti) {
            const nextQty = (murti.quantity || 0) + 1;
            await Murti.findOneAndUpdate({ code: booking.murtiCode }, { $set: { quantity: nextQty, status: 'Available' } });
          }
        } else if (status === 'Completed') {
          const murti = await Murti.findOne({ code: booking.murtiCode });
          if (murti && (murti.quantity || 0) === 0) {
            await Murti.findOneAndUpdate({ code: booking.murtiCode }, { $set: { status: 'Sold' } });
          }
        }
      }
      return booking;
    } else {
      const data = readJSONFile();
      const bIndex = data.bookings.findIndex(b => b.bookingId === bookingId);
      if (bIndex === -1) return null;

      data.bookings[bIndex].status = status;
      const mCode = data.bookings[bIndex].murtiCode;

      const mIndex = data.murtis.findIndex(m => m.code === mCode);
      if (mIndex !== -1) {
        if (status === 'Cancelled') {
          const currentQty = data.murtis[mIndex].quantity !== undefined ? data.murtis[mIndex].quantity : 0;
          data.murtis[mIndex].quantity = currentQty + 1;
          data.murtis[mIndex].status = 'Available';
        } else if (status === 'Completed') {
          const currentQty = data.murtis[mIndex].quantity !== undefined ? data.murtis[mIndex].quantity : 0;
          if (currentQty === 0) {
            data.murtis[mIndex].status = 'Sold';
          }
        }
      }
      writeJSONFile(data);
      return data.bookings[bIndex];
    }
  },

  // Admin CRUD
  async getAdminByEmail(email) {
    if (!isFallbackMode()) {
      return await Admin.findOne({ email });
    } else {
      const data = readJSONFile();
      return data.admins.find(a => a.email === email) || null;
    }
  },

  async updateAdminOTP(email, otpSecret, expires) {
    if (!isFallbackMode()) {
      return await Admin.findOneAndUpdate(
        { email },
        { $set: { otpSecret, otpExpires: expires } },
        { new: true }
      );
    } else {
      const data = readJSONFile();
      const idx = data.admins.findIndex(a => a.email === email);
      if (idx === -1) return null;
      data.admins[idx].otpSecret = otpSecret;
      data.admins[idx].otpExpires = expires.toISOString();
      writeJSONFile(data);
      return data.admins[idx];
    }
  },

  // Analytics Engine
  async getAnalytics() {
    let murtis = [];
    let bookings = [];

    if (!isFallbackMode()) {
      murtis = await Murti.find({});
      bookings = await Booking.find({});
    } else {
      const data = readJSONFile();
      murtis = data.murtis;
      bookings = data.bookings;
    }

    const totalMurtis = murtis.length;
    const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed');
    
    // Revenue calculations
    const revenue = activeBookings.reduce((sum, b) => sum + b.amountPaid, 0);
    const pendingPayments = activeBookings.reduce((sum, b) => sum + b.remainingAmount, 0);
    
    // Most Viewed Murti
    const mostViewed = [...murtis].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    
    // Count stats by category
    const categoryStats = {};
    murtis.forEach(m => {
      categoryStats[m.category] = (categoryStats[m.category] || 0) + 1;
    });

    // Most Booked Category
    const bookingCounts = {};
    activeBookings.forEach(b => {
      const murti = murtis.find(m => m.code === b.murtiCode);
      if (murti) {
        bookingCounts[murti.category] = (bookingCounts[murti.category] || 0) + 1;
      }
    });

    return {
      stats: {
        totalMurtis,
        totalBookings: activeBookings.length,
        revenue,
        pendingPayments,
      },
      mostViewed: mostViewed.map(m => ({ code: m.code, name: m.name, views: m.views, category: m.category, status: m.status })),
      categoryStats,
      bookingCounts
    };
  }
};

module.exports = dataService;
