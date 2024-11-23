import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Loader from '../layout/Loader';
import { getToken } from "../../utils/helper";
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function MonthlyIncomeChart() {
    const [incomeData, setIncomeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchIncomeData = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
            };

            const { data } = await axios.get(`${import.meta.env.VITE_API}/estimated-income`, config);

            const monthlyIncome = data.reduce((acc, item) => {
                acc[item.month] = item.estimatedIncome;
                return acc;
            }, {});

            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();

            const monthsToFetch = [];
            for (let i = -3; i < 12; i++) {
                const date = new Date(currentYear, currentMonth + i, 1);
                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
                monthsToFetch.push(monthKey);
            }

            const filteredData = monthsToFetch.map(monthKey => ({
                month: monthKey,
                income: monthlyIncome[monthKey] || 0,
            }));

            setIncomeData(filteredData);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch income data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncomeData();
    }, []);

    if (loading) return <Loader />;
    if (error) return <div>Error: {error}</div>;

    return (
        <Card sx={{ 
            maxWidth: 800, 
            height: 550,
            margin: 'auto', 
            mt: 4, 
            borderRadius: 4, 
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', 
            background: 'linear-gradient(135deg, #f3e5f5 30%, #e3f2fd 100%)',
        }}>
            <CardContent>
                <Typography variant="h5" component="h2" align="center" gutterBottom sx={{
                    fontWeight: 600,
                    color: '#424242',
                    pb: 2,
                }}>
                    Monthly Estimated Income (15%)
                </Typography>
                <Box sx={{ 
                    height: 400, 
                    backgroundColor: 'white', 
                    borderRadius: 2, 
                    boxShadow: 'inset 0px 4px 20px rgba(0, 0, 0, 0.05)', 
                    p: 2,
                    marginTop: 3
                }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={incomeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis 
                                dataKey="month" 
                                label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
                                tick={{ fill: '#757575' }}
                            />
                            <YAxis 
                                label={{ value: 'Estimated Income (15%)', angle: -90, position: 'insideLeft' }} 
                                tick={{ fill: '#757575' }}
                            />
                            <Tooltip contentStyle={{ backgroundColor: '#f5f5f5', borderColor: '#9e9e9e' }} />
                            <Line type="monotone" dataKey="income" stroke="#6a1b9a" strokeWidth={3} dot={{ fill: '#6a1b9a', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
}
