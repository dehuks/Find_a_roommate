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
  
  getConversations: async () => {
      // Return empty array if not implemented on backend yet
      return []; 
  }
};