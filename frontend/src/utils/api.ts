const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/shree-siddhivinayak-art-website';

// Helper to get Auth Headers
const authHeaders = (token?: string): Record<string, string> => {
  const t = token || (typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '');
  return t ? { 'Authorization': `Bearer ${t}` } : {};
};

// Client-side fallback dataset in case the backend server is unreachable
// This guarantees that the user can explore the frontend fully even without launching the backend.
const clientFallbackMurtis = [
  {
    code: 'GAN-001',
    name: 'Royal Blue Ganpati',
    category: 'Ganpati',
    size: '3.5 Ft',
    price: 15000,
    bookingAmount: 1000,
    status: 'Available',
    photos: ['/images/IMG_5752.jpg'],
    videos: [],
    description: 'Beautiful Royal Blue Shringar Ganpati Idol with intricate hand-painted golden details. Perfect for home or society celebrations.',
    views: 124
  },
  {
    code: 'GAN-002',
    name: 'Lalbaugcha Raja Replica',
    category: 'Ganpati',
    size: '4.0 Ft',
    price: 18500,
    bookingAmount: 1000,
    status: 'Reserved',
    photos: ['/images/IMG_5753.jpg'],
    videos: [],
    description: 'Iconic Lalbaugcha Raja style pose, hand-sculpted in premium clay with a majestic red throne.',
    views: 450
  },
  {
    code: 'GAN-003',
    name: 'Dagadusheth Halwai Ganpati',
    category: 'Ganpati',
    size: '5.0 Ft',
    price: 28000,
    bookingAmount: 2000,
    status: 'Sold',
    photos: ['/images/IMG_5754.jpg'],
    videos: [],
    description: 'Stunning Dagadusheth Halwai replication adorned with heavy replica gold ornaments and crown.',
    views: 612
  },
  {
    code: 'NAV-001',
    name: 'Durga Murti Saree Style',
    category: 'Navratri',
    size: '4.5 Ft',
    price: 22000,
    bookingAmount: 1500,
    status: 'Available',
    photos: ['/images/IMG_5755.jpg'],
    videos: [],
    description: 'Vibrant hand-draped saree style Durga Devi Idol, featuring high-quality finishes and facial expressions.',
    views: 89
  },
  {
    code: 'KRI-001',
    name: 'Makhan Chor Krishna',
    category: 'Krishna Theme',
    size: '2.5 Ft',
    price: 12000,
    bookingAmount: 1000,
    status: 'Available',
    photos: ['/images/IMG_5770.jpg'],
    videos: [],
    description: 'Bal Krishna stealing butter from a pot. Features glossy marble finishing and handmade peacock feathers.',
    views: 78
  },
  {
    code: 'MAV-001',
    name: 'Shivaji Maharaj Theme Ganpati',
    category: 'Mavla Theme',
    size: '3.0 Ft',
    price: 16000,
    bookingAmount: 1000,
    status: 'Available',
    photos: ['/images/IMG_5752.jpg'],
    videos: [],
    description: 'Ganpati sitting on a fort replica, wearing a traditional Maratha Pheta (turban).',
    views: 145
  },
  {
    code: 'ROY-001',
    name: 'Peshwa Style Royal Ganpati',
    category: 'Royal Theme',
    size: '4.5 Ft',
    price: 24000,
    bookingAmount: 1500,
    status: 'Available',
    photos: ['/images/IMG_5753.jpg'],
    videos: [],
    description: 'Royal court setup with a marble-textured Ganesh Idol resting against custom bolsters.',
    views: 180
  },
  {
    code: 'NAR-001',
    name: 'Ugra Narasimha Murti',
    category: 'Narasimha Theme',
    size: '3.5 Ft',
    price: 19000,
    bookingAmount: 1000,
    status: 'Available',
    photos: ['/images/IMG_5754.jpg'],
    videos: [],
    description: 'Intense and powerful carving of Lord Narasimha emerging from the pillar, painted with high-contrast acrylics.',
    views: 95
  }
];

export interface Murti {
  code: string;
  name: string;
  category: string;
  size: string;
  price: number;
  bookingAmount: number;
  status: 'Available' | 'Reserved' | 'Sold' | 'Out Of Stock';
  photos: string[];
  videos: string[];
  description: string;
  views: number;
  quantity?: number;
}

export interface Booking {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  shippingType: 'Self Pickup' | 'Local Delivery' | 'Transport Booking';
  shippingDate: string;
  murtiCode: string;
  amountPaid: number;
  remainingAmount: number;
  paymentId: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

// Helper to get/set offline dataset
const getOfflineMurtis = (): Murti[] => {
  if (typeof window === 'undefined') return clientFallbackMurtis as Murti[];
  const stored = localStorage.getItem('siddhivinayak_murtis');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  // Initialize with fallback
  localStorage.setItem('siddhivinayak_murtis', JSON.stringify(clientFallbackMurtis));
  return clientFallbackMurtis as Murti[];
};

const saveOfflineMurtis = (murtis: Murti[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('siddhivinayak_murtis', JSON.stringify(murtis));
  }
};

const getOfflineBookings = (): Booking[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('siddhivinayak_bookings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  const defaultBookings = [
    {
      bookingId: 'BK-1001',
      customerName: 'Shashank Poojari',
      customerPhone: '9876543210',
      customerCity: 'Mumbai',
      shippingType: 'Transport Booking',
      shippingDate: new Date(Date.now() + 864000000).toISOString(),
      murtiCode: 'GAN-002',
      amountPaid: 1000,
      remainingAmount: 17500,
      paymentId: 'pay_MOCK123456789',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    },
    {
      bookingId: 'BK-1002',
      customerName: 'Rahul Sharma',
      customerPhone: '9123456789',
      customerCity: 'Pune',
      shippingType: 'Self Pickup',
      shippingDate: new Date(Date.now() + 432000000).toISOString(),
      murtiCode: 'GAN-003',
      amountPaid: 28000,
      remainingAmount: 0,
      paymentId: 'pay_MOCK987654321',
      status: 'Completed',
      createdAt: new Date(Date.now() - 30000000).toISOString()
    }
  ] as Booking[];
  localStorage.setItem('siddhivinayak_bookings', JSON.stringify(defaultBookings));
  return defaultBookings;
};

const saveOfflineBookings = (bookings: Booking[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('siddhivinayak_bookings', JSON.stringify(bookings));
  }
};

function adjustMurtiPaths(murti: any): Murti {
  const backendHost = API_BASE.replace('/api', '');
  return {
    ...murti,
    photos: murti.photos.map((p: string) => {
      if (p.startsWith('/uploads/')) {
        return `${backendHost}${p}`;
      }
      if (p.startsWith('/') && basePath && !p.startsWith(basePath)) {
        return `${basePath}${p}`;
      }
      return p;
    }),
    videos: murti.videos.map((v: string) => {
      if (v.startsWith('/uploads/')) {
        return `${backendHost}${v}`;
      }
      if (v.startsWith('/') && basePath && !v.startsWith(basePath)) {
        return `${basePath}${v}`;
      }
      return v;
    }),
  };
}

export const api = {
  basePath,

  // Helper to test if server is up
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE.replace('/api', '')}/health`, { signal: AbortSignal.timeout(1500) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // GET Murtis
  async getMurtis(filters: Record<string, string> = {}): Promise<Murti[]> {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE}/murtis?${queryParams}`);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      return data.map(adjustMurtiPaths);
    } catch (e) {
      console.warn('Backend server offline. Serving client fallbacks.');
      let filtered = getOfflineMurtis();
      if (filters.category) filtered = filtered.filter(m => m.category === filters.category);
      if (filters.status) filtered = filtered.filter(m => m.status === filters.status);
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(m => m.name.toLowerCase().includes(s) || m.code.toLowerCase().includes(s));
      }
      return filtered.map(adjustMurtiPaths) as Murti[];
    }
  },

  // GET Murti Detail
  async getMurti(code: string): Promise<Murti | null> {
    try {
      const res = await fetch(`${API_BASE}/murtis/${code}`);
      if (!res.ok) return null;
      const data = await res.json();
      return adjustMurtiPaths(data);
    } catch {
      const found = getOfflineMurtis().find(m => m.code === code);
      return found ? adjustMurtiPaths(found as Murti) : null;
    }
  },

  // POST Create Booking
  async createBooking(bookingData: {
    customerName: string;
    customerPhone: string;
    customerCity: string;
    shippingType: string;
    shippingDate: string;
    murtiCode: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create booking');
      }
      return await res.json();
    } catch (e: any) {
      console.warn('Backend server offline. Simulating booking response.');
      const list = getOfflineMurtis();
      const m = list.find((m: any) => m.code === bookingData.murtiCode);
      if (!m) throw new Error('Murti not found');
      const qty = m.quantity !== undefined ? m.quantity : 1;
      if (qty <= 0 || m.status !== 'Available') throw new Error('Murti is already booked');

      const newBooking: Booking = {
        bookingId: `BK-MOCK-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: bookingData.customerName,
        customerPhone: bookingData.customerPhone,
        customerCity: bookingData.customerCity,
        shippingType: bookingData.shippingType as any,
        shippingDate: bookingData.shippingDate,
        murtiCode: bookingData.murtiCode,
        amountPaid: m.bookingAmount,
        remainingAmount: m.price - m.bookingAmount,
        paymentId: 'pay_MOCK' + Date.now(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      
      const bookings = getOfflineBookings();
      bookings.push(newBooking);
      saveOfflineBookings(bookings);

      return {
        success: true,
        useMock: true,
        bookingId: newBooking.bookingId,
        amount: m.bookingAmount,
        murti: m
      };
    }
  },

  // POST Verify Payment
  async verifyPayment(verificationData: {
    bookingId: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    simulatedSuccess?: boolean;
  }) {
    try {
      const res = await fetch(`${API_BASE}/bookings/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Payment verification failed');
      }
      return await res.json();
    } catch (e: any) {
      console.warn('Backend server offline. Confirming simulated booking locally.');
      if (verificationData.simulatedSuccess) {
        const bookings = getOfflineBookings();
        const bIdx = bookings.findIndex(b => b.bookingId === verificationData.bookingId);
        if (bIdx !== -1) {
          bookings[bIdx].status = 'Confirmed';
          saveOfflineBookings(bookings);
          
          // Decrement Murti quantity
          const mList = getOfflineMurtis();
          const mIdx = mList.findIndex(m => m.code === bookings[bIdx].murtiCode);
          if (mIdx !== -1) {
            const nextQty = Math.max(0, (mList[mIdx].quantity || 1) - 1);
            mList[mIdx].quantity = nextQty;
            mList[mIdx].status = nextQty === 0 ? 'Sold' : 'Available';
            saveOfflineMurtis(mList);
          }
          return {
            success: true,
            message: 'Local simulation payment verified.',
            booking: bookings[bIdx]
          };
        }
      } else {
        const bookings = getOfflineBookings();
        const bIdx = bookings.findIndex(b => b.bookingId === verificationData.bookingId);
        if (bIdx !== -1) {
          bookings[bIdx].status = 'Cancelled';
          saveOfflineBookings(bookings);
        }
      }
      throw new Error('Simulation payment rejected.');
    }
  },

  // POST Admin Login
  async adminLogin(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Login failed.');
      }
      return await res.json();
    } catch (e: any) {
      // In offline mode, check defaults
      if (email === 'admin@siddhivinayak.com' && password === 'admin123') {
        return {
          message: 'OTP sent to console.',
          email,
          devOtp: '123456' // Provide fallback fixed OTP
        };
      }
      throw new Error(e.message || 'Server offline. Try credentials: admin@siddhivinayak.com / admin123');
    }
  },

  // POST Verify Admin OTP
  async verifyAdminOtp(email: string, otp: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'OTP verification failed');
      }
      return await res.json();
    } catch (e) {
      if (otp === '123456' || otp === 'admin123') {
        const mockToken = 'mock_jwt_token_for_siddhivinayak_admin';
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', mockToken);
        }
        return {
          message: 'Login successful',
          token: mockToken,
          admin: { email }
        };
      }
      throw new Error('Invalid OTP code. Try 123456');
    }
  },

  // GET Admin Booking logs
  async getBookings(token?: string): Promise<Booking[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/bookings`, {
        headers: { ...authHeaders(token) }
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return getOfflineBookings();
    }
  },

  // PUT Update Booking Status
  async updateBookingStatus(bookingId: string, status: string, token?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(token)
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return { success: true, bookingId, status };
    }
  },

  // GET Analytics
  async getAnalytics(token?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/analytics`, {
        headers: { ...authHeaders(token) }
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return {
        stats: {
          totalMurtis: 8,
          totalBookings: 2,
          revenue: 29000,
          pendingPayments: 17500
        },
        mostViewed: [
          { code: 'GAN-003', name: 'Dagadusheth Halwai Ganpati', views: 612, category: 'Ganpati', status: 'Sold' },
          { code: 'GAN-002', name: 'Lalbaugcha Raja Replica', views: 450, category: 'Ganpati', status: 'Reserved' },
          { code: 'GAN-001', name: 'Royal Blue Ganpati', views: 124, category: 'Ganpati', status: 'Available' }
        ],
        categoryStats: {
          'Ganpati': 3,
          'Navratri': 1,
          'Krishna Theme': 1,
          'Mavla Theme': 1,
          'Royal Theme': 1,
          'Narasimha Theme': 1
        },
        bookingCounts: {
          'Ganpati': 2
        }
      };
    }
  },

  // POST Add Murti
  async addMurti(formData: FormData, token?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/murtis`, {
        method: 'POST',
        headers: {
          ...authHeaders(token)
          // Note: FormData automatically sets multipart/form-data boundary
        },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create Murti');
      }
      return await res.json();
    } catch (e: any) {
      console.warn('Backend server offline. Simulating local Murti add.');
      const newCode = (formData.get('code') as string) || `GAN-${Math.floor(100 + Math.random() * 900)}`;
      const newMurti: Murti = {
        code: newCode,
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        size: formData.get('size') as string,
        price: Number(formData.get('price')),
        bookingAmount: Number(formData.get('bookingAmount') || 1000),
        quantity: Number(formData.get('quantity') || 1),
        description: (formData.get('description') as string) || '',
        photos: ['https://images.unsplash.com/photo-1609252509102-ee7026b2161f?w=800&auto=format&fit=crop'],
        videos: [],
        status: 'Available',
        views: 0
      };
      
      const current = getOfflineMurtis();
      const filtered = current.filter(m => m.code !== newMurti.code);
      filtered.push(newMurti);
      saveOfflineMurtis(filtered);

      return {
        message: 'Murti created locally (Mock).',
        murti: newMurti
      };
    }
  },

  // PUT Update Murti Status
  async updateMurtiStatus(code: string, status: string, token?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/murtis/${code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(token)
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('API Error');
      return await res.json();
    } catch {
      return { success: true, code, status };
    }
  }
};
