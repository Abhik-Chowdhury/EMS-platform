import  { useContext } from 'react'
import { AuthContext } from './authStore'

export const useAuth = () => {
    const context = useContext(AuthContext);

    if(!context) {
        throw new Error("useAuth must be use inside AuthProvider");
    }

    return context;
}