import axios from 'axios';

const isProduction = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');

const API = axios.create({
  baseURL: isProduction
    ? 'https://ayamgeprek3alam.pythonanywhere.com/api/'
    : 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
