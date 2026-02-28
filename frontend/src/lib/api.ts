const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const fetchWithTimeout = async (url: string, options: any = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Превышено время ожидания ответа от сервера');
    }
    throw error;
  }
};

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    let errorDetail = 'Произошла ошибка при запросе к серверу';
    try {
      const errorData = await res.json();
      errorDetail = errorData.detail || errorDetail;
    } catch (e) {}
    throw new Error(errorDetail);
  }
  return res.json();
};

export interface Wishlist {
  id: number;
  title: string;
  description?: string;
  theme: string;
  created_at: string;
  deadline?: string;
  is_archived: boolean;
  public_slug?: string;
  gifts: Gift[];
  total_value: number;
  total_collected: number;
  completion_percentage: number;
}

export interface Gift {
  id: number;
  title: string;
  url?: string;
  price: number;
  image_url?: string;
  is_reserved: boolean;
  collected_amount: number;
  wishlist_id: number;
  created_at: string;
  progress_percentage: number;
}

export interface CreateWishlistData {
  title: string;
  description?: string;
  theme: string;
  deadline?: string;
  is_private?: boolean;
  custom_theme_name?: string;
}

export interface CreateGiftData {
  title: string;
  url?: string;
  price: number;
  image_url?: string;
  wishlist_id: number;
}

export interface ContributionData {
  amount: number;
  contributor_email?: string;
  message?: string;
}

export const api = {
  // Auth
  register: async (email: string, password: string, username: string) => {
    const res = await fetchWithTimeout(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username })
    });
    return handleResponse(res);
  },

  login: async (email: string, password: string) => {
    const res = await fetchWithTimeout(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetchWithTimeout(`${API_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Friends
  getFriends: async () => {
    const res = await fetchWithTimeout(`${API_URL}/friends/list`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getFriendRequests: async () => {
    const res = await fetchWithTimeout(`${API_URL}/friends/requests`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  searchUsers: async (query: string) => {
    const res = await fetchWithTimeout(`${API_URL}/friends/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  sendFriendRequest: async (userId: number) => {
    const res = await fetchWithTimeout(`${API_URL}/friends/request/${userId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  acceptFriendRequest: async (friendshipId: number) => {
    const res = await fetchWithTimeout(`${API_URL}/friends/accept/${friendshipId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  rejectFriendRequest: async (friendshipId: number) => {
    const res = await fetchWithTimeout(`${API_URL}/friends/reject/${friendshipId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  updateProfile: async (data: {username?: string, nickname?: string, avatar_url?: string}) => {
    const res = await fetchWithTimeout(`${API_URL}/auth/update`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getAllPublicWishlists: async (): Promise<Wishlist[]> => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/public/all`);
    return handleResponse(res);
  },

  uploadImage: async (file: File): Promise<{url: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/wishlists/upload`, {
      method: 'POST',
      body: formData
    });
    return handleResponse(res);
  },

  // Wishlists
  getMyWishlists: async (): Promise<Wishlist[]> => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/my`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getFriendsWishlists: async (): Promise<Wishlist[]> => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/friends`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getWishlist: async (id: number): Promise<Wishlist> => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  getPublicWishlist: async (slug: string): Promise<Wishlist> => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/public/${slug}`);
    return handleResponse(res);
  },

  createWishlist: async (data: CreateWishlistData): Promise<Wishlist> => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateWishlist: async (id: number, data: Partial<CreateWishlistData>): Promise<Wishlist> => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteWishlist: async (id: number) => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Gifts
  addGift: async (wishlistId: number, data: Partial<CreateGiftData>): Promise<Gift> => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/${wishlistId}/gifts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateGift: async (giftId: number, data: Partial<CreateGiftData>): Promise<Gift> => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/gifts/${giftId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  deleteGift: async (giftId: number) => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/gifts/${giftId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  scrapeUrl: async (url: string) => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/scrape?url=${encodeURIComponent(url)}`, {
      method: 'POST'
    }, 60000); // 60 seconds timeout
    return handleResponse(res);
  },

  // Public actions
  reserveGift: async (giftId: number, email?: string) => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/gifts/${giftId}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(res);
  },

  contributeToGift: async (giftId: number, data: ContributionData) => {
    const res = await fetchWithTimeout(`${API_URL}/wishlists/gifts/${giftId}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};
