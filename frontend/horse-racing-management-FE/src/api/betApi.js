import axiosInstance from './axiosInstance';

/**
 
 * Đặt cược (chỉ dành cho CUSTOMER)
 * @param {{ raceId: number, betItems: Array<{ raceHorseId: number, betAmount: number }> }} payload
 */
export const placeBet = (payload) =>
  axiosInstance.post('/bets', payload).then((res) => res.data.data);


export const getMyBets = () =>
  axiosInstance.get('/bets/my-bets').then((res) => res.data.data);
