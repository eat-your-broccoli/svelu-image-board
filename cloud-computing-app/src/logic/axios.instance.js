/* eslint-disable import/no-anonymous-default-export */
import api from '../config/api.config.json';
import axios from 'axios';
import { useContext } from 'react';
import { AccountContext } from '../components/Accounts';

const axiosInstance = axios.create({
    baseURL: api.api_url,
    timeout: 10000,
});

export default function GetAxiosInstance() {
    const { getSession } = useContext(AccountContext);
    console.log(axios.request.interceptors)
    axiosInstance.interceptors.request.use(async (request) => {
        const session = await getSession();
        request.headers.common['Authorization'] = session.headers.Authorization;
        return request;
    });
    return axiosInstance;
};