/**
 * raceApi.js — API functions for Race module
 * Base URL: /api/races
 */
import axiosInstance from './axiosInstance';

// GET /races — public — list races (params: status?, page, size)
export const getRaces = (params) =>
  axiosInstance.get('/races', { params }).then((res) => res.data);

// GET /races/{id} — public — get race detail
export const getRaceById = (id) =>
  axiosInstance.get(`/races/${id}`).then((res) => res.data);

// POST /races/create — ADMIN — create new race
export const createRace = (data) =>
  axiosInstance.post('/races/create', data).then((res) => res.data);

// PUT /races/update/{id} — ADMIN — update race
export const updateRace = (id, data) =>
  axiosInstance.put(`/races/update/${id}`, data).then((res) => res.data);

// DELETE /races/{id} — ADMIN — delete race
export const deleteRace = (id) =>
  axiosInstance.delete(`/races/${id}`).then((res) => res.data);
