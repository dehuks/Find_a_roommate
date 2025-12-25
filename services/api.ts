import { useAuthStore } from '../store/authStore';

// 🛑 REPLACE THIS WITH YOUR CURRENT NGROK URL
const BASE_URL = 'https://embryogenic-cierra-nondistortingly.ngrok-free.dev/api'; 

const getHeaders = (token?: string) => {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  // If we have a token (passed in or from store), add it
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const authAPI = {
  login: async (email: string, pass: string) => {
    // 1. Get Token
    const response = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    if (!response.ok) {
        throw new Error('Invalid email or password');
    }
    
    const tokens = await response.json(); // { access, refresh }

    // 2. Try to Get User Profile (Safe Mode)
    try {
        const profileResponse = await fetch(`${BASE_URL}/users/me/`, {
            headers: getHeaders(tokens.access),
        });

        if (!profileResponse.ok) {
            // Log the REAL error to your terminal so we know what to fix
            console.log("⚠️ PROFILE FETCH ERROR:", profileResponse.status);
            const text = await profileResponse.text();
            console.log("⚠️ ERROR BODY:", text);
            
            // Return fallback user so you are not locked out
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
        // Return fallback user
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
        gender: 'prefer_not_to_say' // Default for now
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
        current_password: oldPassword, // Must match Python keys
        new_password: newPassword 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Password Change Failed:", errorText);
      
      // Try to parse clean JSON error
      try {
        const errJson = JSON.parse(errorText);
        // Returns "Invalid current password" or similar
        throw new Error(errJson.error || errJson.detail || "Password change failed");
      } catch (e: any) {
        // Fallback if parsing fails (but we prefer the error above)
        if (e.message !== "Unexpected token") throw e; 
        throw new Error(`Server Error: ${response.status}`);
      }
    }
    
    return true;
  }
  
};

export const dataAPI = {
  getListings: async () => {
    // We get the token from the store state directly
    const token = useAuthStore.getState().user?.token;
    
    const response = await fetch(`${BASE_URL}/listings/`, {
      headers: getHeaders(token),
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    // Map Django fields to UI fields if necessary
    return data.map((item: any) => ({
      id: item.listing_id,
      title: item.title,
      price: item.rent_amount,
      location: item.city,
      type: item.room_type,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', // Fallback image if none
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
      // Note: Assuming /preferences/ returns a list, we take the first one or create it
      const response = await fetch(`${BASE_URL}/preferences/`, { headers: getHeaders(token) });
      if (!response.ok) return null;
      const data = await response.json();
      // If list, return first item, else return data
      return Array.isArray(data) ? data[0] : data; 
    } catch (e) {
      return null;
    }
  },

  // 2. Update/Create Preferences
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

  // 3. Update Basic Profile
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
    // Handle array case if it comes from search params
    const userId = Array.isArray(id) ? id[0] : id;
    
    const response = await fetch(`${BASE_URL}/users/${userId}/`, {
      headers: getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to load user profile');
    return await response.json();
  },
  
  getConversations: async () => {
      // Return empty array if not implemented on backend yet
      return []; 
  }
};
export const chatAPI = {
  // 1. Get All Chats (Inbox)
  getConversations: async () => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/conversations/`, { headers: getHeaders(token) });
    return await response.json();
  },

  // 2. Start/Get a Chat with a specific user
  startChat: async (targetUserId: number) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/conversations/start/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ user_id: targetUserId })
    });
    return await response.json();
  },

  // 3. Get Messages for a specific chat
  getMessages: async (conversationId: number) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/messages/?conversation=${conversationId}`, {
      headers: getHeaders(token)
    });
    return await response.json();
  },

  // 4. Send a Message
  sendMessage: async (conversationId: number, text: string) => {
    const token = useAuthStore.getState().user?.token;
    const response = await fetch(`${BASE_URL}/messages/`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ conversation: conversationId, message_text: text })
    });
    return await response.json();
  }
};