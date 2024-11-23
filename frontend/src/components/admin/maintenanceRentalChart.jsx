import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import { getToken } from '../../utils/helper';
import Loader from '../layout/Loader';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function MaintenanceVsRentalChart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMaintenanceVsRentalData = async () => {
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                },
            };
            const response = await axios.get(`${import.meta.env.VITE_API}/maintenance-vs-rental`, config);
            setData(response.data);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaintenanceVsRentalData();
    }, []);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <Typography color="error" variant="h6" align="center">{`Error: ${error}`}</Typography>;
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
            <Card sx={{ 
                maxWidth: 900, 
                width: '100%', 
                margin: 'auto', 
                borderRadius: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', 
                background: 'linear-gradient(135deg, #f3e5f5 30%, #e3f2fd 100%)', 
                }}>
                <CardContent>
                    <Typography variant="h5" component="h2" align="center" gutterBottom sx={{
                    fontWeight: 600,
                    color: '#424242',
                    pb: 2,
                }}>
                        Maintenance vs. Rental Income
                    </Typography>
                    <Box sx={{ height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%" >
                            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="carModel" label={{ value: 'Car Model', position: 'insideBottom', offset: -5 }} />
                                <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend verticalAlign="top" align="right" />
                                <Bar dataKey="totalRentalIncome" fill="#82ca9d" name="Rental Income" />
                                <Bar dataKey="totalMaintenanceCost" fill="#ff7f0e" name="Maintenance Cost" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
