// API Client for Hospital Management System
const API_BASE_URL = 'http://localhost:8080/api';

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token');
};

// Set auth token in localStorage
export const setAuthToken = (token: string): void => {
    localStorage.setItem('auth_token', token);
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
};

// Generic API request function
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
    }

    return data;
}

// Authentication API
export const authAPI = {
    login: async (email: string, password: string) => {
        const data = await apiRequest<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setAuthToken(data.token);
        return data;
    },

    register: async (userData: {
        name: string;
        email: string;
        password: string;
        phone?: string;
        dateOfBirth?: string;
        bloodGroup?: string;
        address?: string;
    }) => {
        return apiRequest<{ message: string; email: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    verifyEmail: async (token: string) => {
        return apiRequest<{ message: string; verified: boolean }>(
            `/auth/verify-email/${token}`,
            { method: 'GET' }
        );
    },

    forgotPassword: async (email: string) => {
        return apiRequest<{ message: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    resetPassword: async (token: string, password: string) => {
        return apiRequest<{ message: string; success: boolean }>(
            `/auth/reset-password/${token}`,
            {
                method: 'POST',
                body: JSON.stringify({ password }),
            }
        );
    },

    logout: () => {
        removeAuthToken();
    },
};

// Users API
export const usersAPI = {
    getCurrentUser: async () => {
        return apiRequest<any>('/users/me');
    },

    getAllUsers: async () => {
        return apiRequest<any[]>('/users');
    },
};

// Doctors API
export const doctorsAPI = {
    getAll: async (search?: string) => {
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        return apiRequest<any[]>(`/doctors${params}`, { method: 'GET' });
    },

    getSpecializations: async () => {
        return apiRequest<any[]>('/doctors/specializations', { method: 'GET' });
    },

    getBySpecialization: async (specialization: string, date?: string) => {
        const params = date ? `?date=${encodeURIComponent(date)}` : '';
        return apiRequest<any[]>(`/doctors/by-specialization/${encodeURIComponent(specialization)}${params}`, { method: 'GET' });
    },

    getById: async (id: string) => {
        return apiRequest<any>(`/doctors/${id}`, { method: 'GET' });
    },

    getAvailability: async (id: string) => {
        return apiRequest<any[]>(`/doctors/${id}/availability`, { method: 'GET' });
    },

    create: async (data: any) => {
        return apiRequest<any>('/doctors', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: any) => {
        return apiRequest<any>(`/doctors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    updateAvailability: async (id: string, availability: any) => {
        return apiRequest<any>(`/doctors/${id}/availability`, {
            method: 'PUT',
            body: JSON.stringify({ availability }),
        });
    },

    delete: async (id: string) => {
        return apiRequest<any>(`/doctors/${id}`, { method: 'DELETE' });
    },
};

// Patients API
export const patientsAPI = {
    getAll: async () => {
        return apiRequest<any[]>('/patients');
    },

    getById: async (id: string) => {
        return apiRequest<any>(`/patients/${id}`);
    },

    create: async (data: any) => {
        return apiRequest<any>('/patients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, patientData: any) => {
        return apiRequest<any>(`/patients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(patientData),
        });
    },

    delete: async (id: string) => {
        return apiRequest<any>(`/patients/${id}`, {
            method: 'DELETE',
        });
    },
};

// Appointments API
export const appointmentsAPI = {
    getAll: async () => {
        return apiRequest<any[]>('/appointments');
    },

    getById: async (id: string) => {
        return apiRequest<any>(`/appointments/${id}`);
    },

    create: async (appointmentData: any) => {
        return apiRequest<any>('/appointments', {
            method: 'POST',
            body: JSON.stringify(appointmentData),
        });
    },

    update: async (id: string, appointmentData: any) => {
        return apiRequest<any>(`/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(appointmentData),
        });
    },

    delete: async (id: string) => {
        return apiRequest<any>(`/appointments/${id}`, {
            method: 'DELETE',
        });
    },
};

// Medical Records API
export const medicalRecordsAPI = {
    getAll: async () => {
        return apiRequest<any[]>('/medical-records');
    },

    getById: async (id: string) => {
        return apiRequest<any>(`/medical-records/${id}`);
    },

    create: async (recordData: any) => {
        return apiRequest<any>('/medical-records', {
            method: 'POST',
            body: JSON.stringify(recordData),
        });
    },

    update: async (id: string, recordData: any) => {
        return apiRequest<any>(`/medical-records/${id}`, {
            method: 'PUT',
            body: JSON.stringify(recordData),
        });
    },

    delete: async (id: string) => {
        return apiRequest<any>(`/medical-records/${id}`, {
            method: 'DELETE',
        });
    },
};

// Statistics API
export const statsAPI = {
    getAdminStats: async () => {
        return apiRequest<any>('/stats/admin');
    },

    getDoctorStats: async (doctorId: string) => {
        return apiRequest<any>(`/stats/doctor/${doctorId}`);
    },

    getPatientStats: async (patientId: string) => {
        return apiRequest<any>(`/stats/patient/${patientId}`);
    },
};

export default {
    auth: authAPI,
    users: usersAPI,
    doctors: doctorsAPI,
    patients: patientsAPI,
    appointments: appointmentsAPI,
    medicalRecords: medicalRecordsAPI,
    stats: statsAPI,
};
