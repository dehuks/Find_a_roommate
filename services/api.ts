import { useAuthStore } from '../store/authStore';

// 🛑 UPDATE THIS EVERY TIME YOU RESTART NGROK
const NGROK_ID = 'pneumococcal-ternately-deedra.ngrok-free.dev'; 
export const BASE_URL = `https://${NGROK_ID}/api`;
export const SERVER_URL = `https://${NGROK_ID}`; 

const getHeaders = (token?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const authAPI = {
  login: async (email: string, pass: string) => {
    try {
      const response = await fetch(`${BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      if (!response.ok) throw new Error('Invalid email or password');
      
      const tokens = await response.json();

      const profileResponse = await fetch(`${BASE_URL}/users/me/`, {
          headers: getHeaders(tokens.access),
      });

      if (!profileResponse.ok) {
          return { 
              user_id: 0, 
              email: email, 
              full_name: "User", 
              role: "seeker", 
              is_verified: false,
              token: tokens.access 
          };
      }
      
      const userData = await profileResponse.json();
      return { ...userData, token: tokens.access };

    } catch (e) {
      console.error("Login Error:", e);
      throw e;
    }
  },

  register: async (fullName: string, email: string, pass: string, phone: string, role: string, gender: string) => {
    const response = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        full_name: fullName, 
        email, 
        password: pass, 
        phone_number: phone, 
        role: role, 
        gender: gender
      }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
    }
    return await response.json();
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/users/set_password/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ 
        current_password: oldPassword,
        new_password: newPassword 
      }),
    });

    if (!response.ok) throw new Error("Password change failed");
    return true;
  }
};

export const dataAPI = {
  getListings: async () => {
    const token = useAuthStore.getState().user?.token;
    
    try {
      const response = await fetch(`${BASE_URL}/listings/`, {
        headers: getHeaders(token),
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      return data.map((item: any) => {
        const firstImage = item.images && item.images.length > 0 
          ? item.images[0].image_file 
          : null;

        const displayImage = firstImage
          ? (firstImage.startsWith('http') ? firstImage : `${SERVER_URL}${firstImage}`)
          : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267';

        return {
          ...item, 
          id: item.listing_id,
          price: item.rent_amount,
          location: item.city,
          type: item.room_type,
          image: displayImage, 
        };
      });
    } catch (e) {
      console.error("Fetch Listings Error:", e);
      return [];
    }
  },

  getMatches: async () => {
    const token = useAuthStore.getState().user?.token;
    
    try {
      const response = await fetch(`${BASE_URL}/matches/`, { headers: getHeaders(token) });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      
      // Safety check for array
      if (!Array.isArray(data)) return [];

      return data.map((match: any) => ({
        ...match,
        user: {
          ...match.user,
          image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
        }
      }));

    } catch (e) {
      console.error("Fetch Matches Error:", e);
      return [];
    }
  },

  // 👇 Added getUser (was missing)
  getUser: async (id: string | string[]) => {
    const token = useAuthStore.getState().user?.token;
    const userId = Array.isArray(id) ? id[0] : id;
    
    const response = await fetch(`${BASE_URL}/users/${userId}/`, {
      headers: getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to load user profile');
    return await response.json();
  },

  getProfile: async () => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/users/me/`, { headers: getHeaders(token) });
    if (!response.ok) return null;
    return await response.json();
  },

  getPreferences: async () => {
    try {
      const token = useAuthStore.getState().user?.token;
      const response = await fetch(`${BASE_URL}/preferences/`, { headers: getHeaders(token) });
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data; 
    } catch (e) {
      return null;
    }
  },

  updatePreferences: async (data: any, id?: number) => {
    const token = useAuthStore.getState().user?.token;
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `${BASE_URL}/preferences/${id}/` : `${BASE_URL}/preferences/`;

    const response = await fetch(url, {
      method,
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to save preferences');
    return await response.json();
  },

  updateProfile: async (userId: number, data: any) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/users/${userId}/`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to update profile');
    return await response.json();
  },

  submitVerification: async (formData: FormData) => {
    const token = useAuthStore.getState().user?.token;
    if (!token) throw new Error("No authentication token found.");

    const response = await fetch(`${BASE_URL}/verifications/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }, 
      body: formData,
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("Verification Error:", text.slice(0, 200));
        throw new Error(`Server Error: ${response.status}`);
    }
    return await response.json();
  },

  // 👇 MOVED HERE from chatAPI (Correct Location)
  createListing: async (formData: FormData) => {
    const token = useAuthStore.getState().user?.token;
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${BASE_URL}/listings/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No Content-Type for FormData
      },
      body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Create Listing Error:", errorText);
        throw new Error("Failed to post listing. Please check your inputs.");
    }
    
    return await response.json();
  },
  getMyListings: async () => {
    const token = useAuthStore.getState().user?.token;
    const user_id = useAuthStore.getState().user?.user_id;

    // We fetch all and filter by owner ID (Client-side filtering for MVP)
    const allListings = await dataAPI.getListings();
    return allListings.filter((item: any) => item.owner === user_id);
  },

  // 👇 2. Delete a Listing
  deleteListing: async (listingId: number) => {
    const token = useAuthStore.getState().user?.token;
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${BASE_URL}/listings/${listingId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
        throw new Error("Failed to delete listing");
    }
    return true;
  },
  updatePushToken: async (token: string) => {
    const authUser = useAuthStore.getState().user;
    if (!authUser?.token) return;

    await fetch(`${BASE_URL}/users/${authUser.user_id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authUser.token}`,
      },
      body: JSON.stringify({ expo_push_token: token }),
    });
  },
};

export const chatAPI = {
  getConversations: async () => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/conversations/`, { headers: getHeaders(token) });
    if (!response.ok) return [];
    return await response.json();
  },

  startChat: async (targetUserId: number) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/conversations/start/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ user_id: targetUserId })
    });
    if (!response.ok) throw new Error('Failed to start conversation');
    return await response.json();
  },

  getMessages: async (conversationId: number) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/messages/?conversation=${conversationId}`, {
      headers: getHeaders(token)
    });
    if (!response.ok) return [];
    return await response.json();
  },

  sendMessage: async (conversationId: number, text: string) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/messages/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ conversation: conversationId, message_text: text })
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  }
};