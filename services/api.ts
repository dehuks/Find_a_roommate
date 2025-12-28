import { useAuthStore } from '../store/authStore';

// 🛑 REPLACE THIS WITH YOUR CURRENT NGROK URL
const BASE_URL = 'https://embryogenic-cierra-nondistortingly.ngrok-free.dev/api'; 

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
    const response = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    if (!response.ok) {
        throw new Error('Invalid email or password');
    }
    
    const tokens = await response.json();

    try {
        const profileResponse = await fetch(`${BASE_URL}/users/me/`, {
            headers: getHeaders(tokens.access),
        });

        if (!profileResponse.ok) {
            console.log("⚠️ PROFILE FETCH ERROR:", profileResponse.status);
            const text = await profileResponse.text();
            console.log("⚠️ ERROR BODY:", text);
            
            return { 
                user_id: 1, 
                email: email, 
                full_name: "User (Backend Error)", 
                phone_number: "",
                role: "seeker",
                token: tokens.access 
            };
        }
        
        const userData = await profileResponse.json();
        return { ...userData, token: tokens.access };

    } catch (e) {
        console.error("Network Error during profile fetch:", e);
        return { 
            user_id: 1, 
            email: email, 
            full_name: "User (Network Error)", 
            phone_number: "",
            role: "seeker",
            token: tokens.access 
        };
    }
  },

  register: async (fullName: string, email: string, pass: string, phone: string) => {
    const response = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        full_name: fullName, 
        email, 
        password: pass, 
        phone_number: phone, 
        role: 'seeker', 
        gender: 'prefer_not_to_say'
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
    
    console.log("Changing password...");

    const response = await fetch(`${BASE_URL}/users/set_password/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ 
        current_password: oldPassword,
        new_password: newPassword 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Password Change Failed:", errorText);
      
      try {
        const errJson = JSON.parse(errorText);
        throw new Error(errJson.error || errJson.detail || "Password change failed");
      } catch (e: any) {
        if (e.message !== "Unexpected token") throw e; 
        throw new Error(`Server Error: ${response.status}`);
      }
    }
    
    return true;
  }
};

export const dataAPI = {
  getListings: async () => {
    const token = useAuthStore.getState().user?.token;
    
    const response = await fetch(`${BASE_URL}/listings/`, {
      headers: getHeaders(token),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.listing_id,
      title: item.title,
      price: item.rent_amount,
      location: item.city,
      type: item.room_type,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    }));
  },

  getMatches: async () => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/matches/`, { headers: getHeaders(token) });
    if (!response.ok) return [];
    const data = await response.json();
    return data; 
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

  getUser: async (id: string | string[]) => {
    const token = useAuthStore.getState().user?.token;
    const userId = Array.isArray(id) ? id[0] : id;
    
    const response = await fetch(`${BASE_URL}/users/${userId}/`, {
      headers: getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to load user profile');
    return await response.json();
  }
};

export const chatAPI = {
  // Get all conversations (inbox)
  getConversations: async () => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/conversations/`, { 
      headers: getHeaders(token) 
    });
    
    if (!response.ok) {
      console.error("Failed to load conversations:", response.status);
      return [];
    }
    
    return await response.json();
  },

  // Start or get existing chat with a user
  startChat: async (targetUserId: number) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/conversations/start/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ user_id: targetUserId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to start conversation');
    }
    
    return await response.json();
  },

  // Get messages for a conversation
  getMessages: async (conversationId: number) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/messages/?conversation=${conversationId}`, {
      headers: getHeaders(token)
    });
    
    if (!response.ok) {
      console.error("Failed to load messages:", response.status);
      return [];
    }
    
    return await response.json();
  },

  // Send a message
  sendMessage: async (conversationId: number, text: string) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/messages/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ 
        conversation: conversationId, 
        message_text: text 
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return await response.json();
  }
};