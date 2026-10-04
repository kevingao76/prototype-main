import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8080';

const AuthContext = createContext();

const fetchLogIn = async () => {
    try {
        const token = localStorage.getItem('logInInfo');
        if (!token) {
            console.log('No token found');
            return;
        }
        const { data } = await axios.get('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return { data };
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
};

const AuthProvider = ({ children }) => {
    const [logIn, setLogIn] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    const login = async (logInData) => {
        const response = await axios.post('/api/auth/login', logInData);
        const token = response.data.logIn.token;
        localStorage.setItem('logInInfo', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setLogIn(response.data.logIn);
        return response;
    };

    const registerServiceReceiver = async (logInData) => {
        try {
            const response = await axios.post('/api/auth/register-service-receiver', logInData);
            setLogIn(response.data.logIn);
            return response;
        } catch (error) {
            console.error(error);
            return error;
        }
    };

    const registerServiceProvider = async (logInData) => {
        try {
            const response = await axios.post('/api/auth/register-service-provider', logInData);
            setLogIn(response.data.logIn);
            return response;
        } catch (error) {
            console.error(error);
            return error;
        }
    };

    const logout = () => {
        setLogIn(null);
        localStorage.removeItem('logInInfo');
        localStorage.removeItem('profileImage')
        delete axios.defaults.headers.common['Authorization'];
    };

    useEffect(() => {
        const token = localStorage.getItem('logInInfo');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchLogIn().then(response => {
                if (response && response.data) {
                    setLogIn(response.data.logIn);
                }
            }).catch(error => {
                console.error('Error fetching profile on mount:', error);
            }).finally(() => {
                setLoading(false); // Set loading to false after fetching
            });
        } else {
            setLoading(false); // No token, set loading to false
        }
    }, []);

    return (
        <AuthContext.Provider value={{ logIn, loading, login, registerServiceReceiver, registerServiceProvider, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext, fetchLogIn };
