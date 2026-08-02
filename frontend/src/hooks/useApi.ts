"use client";

import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

interface ApiResponse<T> {
    data: T;
    status: number;
    statusText: string;
}

const useApi = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleRequest = async <T>(
        request: Promise<any>,
    ): Promise<ApiResponse<T>> => {
        setLoading(true);
        setError(null);
        try {
            const response = await request;
            setLoading(false);
            return {
                data: response.data,
                status: response.status,
                statusText: response.statusText,
            };
        } catch (error: any) {
            setLoading(false);
            if (error.response) {
                setError(error.response.data.message || "An error occurred");
            } else if (error.request) {
                setError("No response received from server");
            } else {
                setError(error.message);
            }
            throw error;
        }
    };
    const get = async <T>(url: string, params?: object) => {
        return handleRequest(axiosInstance.get<T>(url, { params }));
    };

    const post = async <T>(url: string, data: object, headers?: object) => {
        return handleRequest(axiosInstance.post<T>(url, data, headers));
    };

    const put = async <T>(url: string, data: object) => {
        return handleRequest(axiosInstance.put<T>(url, data));
    };

    const patch = async <T>(url: string, data: object) => {
        return handleRequest(axiosInstance.patch<T>(url, data));
    };

    const del = async <T>(url: string, data?: object) => {
        return handleRequest(axiosInstance.delete<T>(url, data));
    };

    return {
        loading,
        error,
        get,
        post,
        put,
        patch,
        del,
    };
};

export default useApi;
