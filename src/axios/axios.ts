import axios, { AxiosInstance } from "axios";

const baseURL = "http://ec2-54-145-211-254.compute-1.amazonaws.com:3000/";

const clienteAxios: AxiosInstance = axios.create({
    baseURL,
    headers: {
        "Content-Type": 'application/json',
    },
});

export default clienteAxios;