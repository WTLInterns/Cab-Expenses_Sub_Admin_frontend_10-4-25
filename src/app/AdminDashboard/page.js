'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import Sidebar from '../slidebar/page';
import { MdOutlineDirectionsCar, MdOutlineAccountBalanceWallet, MdPerson } from "react-icons/md";
import { BsClipboardCheck } from "react-icons/bs";
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalDrivers: 0,
        totalCabs: 0,
        assignedCabs: 0,
        totalExpenses: 0,
    });

    const [expenseData, setExpenseData] = useState([]);
    const [expenseBreakdown, setExpenseBreakdown] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found! Please log in.");
                    return;
                }

                const headers = { headers: { Authorization: `Bearer ${token}` } };

                const [driversRes, cabsRes, assignedCabsRes, expensesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/driver/profile', headers),
                    axios.get('http://localhost:5000/api/cabs', headers),
                    axios.get('http://localhost:5000/api/assigncab', headers),
                    axios.get('http://localhost:5000/api/cabs/cabExpensive', headers)
                ]);

                const expensesArray = expensesRes.data?.data || [];

                const totalExpenses = expensesArray.reduce((acc, curr) => acc + (curr.totalExpense || 0), 0);

                const monthlyExpenseData = expensesArray.map((exp, index) => ({
                    month: `Cab ${index + 1} (${exp.cabNumber})`,
                    expense: exp.totalExpense || 0
                }));

                // **Aggregate expenses by category**
                const aggregatedBreakdown = expensesArray.reduce((acc, exp) => {
                    for (const key in exp.breakdown) {
                        acc[key] = (acc[key] || 0) + (exp.breakdown[key] || 0);
                    }
                    return acc;
                }, {});

                const formattedBreakdown = Object.keys(aggregatedBreakdown).map(key => ({
                    name: key,
                    value: aggregatedBreakdown[key]
                }));

                setStats({
                    totalDrivers: driversRes.data.length || 0,
                    totalCabs: cabsRes.data.length || 0,
                    assignedCabs: assignedCabsRes.data.length || 0,
                    totalExpenses: totalExpenses,
                });

                setExpenseData(monthlyExpenseData);
                setExpenseBreakdown(formattedBreakdown);

            } catch (error) {
                console.error("Error fetching dashboard data:", error?.response?.data || error.message || error);
            }
        };

        fetchDashboardData();
    }, []);

    const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#A020F0'];

    const gradientColors = [
        "bg-gray-800",
        "bg-gray-800",
        "bg-gray-800",
        "bg-gray-800"
    ];

    return (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 min-h-screen flex text-white">
            <Sidebar />

            <div className="p-8 flex-1">
                <motion.h1
                    className="text-3xl font-bold mb-6 text-center text-gray-200"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Admin Dashboard
                </motion.h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {[
                        { label: 'Total Drivers', value: stats.totalDrivers, icon: <MdPerson size={28} /> },
                        { label: 'Total Cabs', value: stats.totalCabs, icon: <MdOutlineDirectionsCar size={28} /> },
                        { label: 'Assigned Cabs', value: stats.assignedCabs, icon: <BsClipboardCheck size={28} /> },
                        { label: 'Total Expenses', value: `₹${stats.totalExpenses}`, icon: <MdOutlineAccountBalanceWallet size={28} /> }
                    ].map((card, index) => (
                        <motion.div
                            key={index}
                            className={`p-5  ${gradientColors[index]} shadow-lg rounded-lg flex items-center space-x-4 transition-transform transform hover:scale-105 hover:shadow-2xl`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="p-4 bg-white text-gray-800 rounded-full">{card.icon}</div>
                            <div className="text-white">
                                <h2 className="text-lg font-semibold">{card.label}</h2>
                                <p className="text-2xl font-bold">{card.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <motion.div
                        className="bg-gray-800 p-6 shadow-xl rounded-lg"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-lg font-semibold mb-4 text-gray-200">Monthly Expenses per Cab</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={expenseData}>
                                <XAxis dataKey="month" stroke="#E5E7EB" />
                                <YAxis stroke="#E5E7EB" />
                                <Tooltip contentStyle={{ backgroundColor: "#333", borderRadius: "5px" }} />
                                <Bar dataKey="expense" fill="#6366F1" barSize={30} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <motion.div
                        className="bg-gray-800 p-6 shadow-xl rounded-lg"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h2 className="text-lg font-semibold mb-4 text-gray-200">Expense Breakdown</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={expenseBreakdown}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, value }) => `${name}:₹${value}`}
                                    labelStyle={{ fill: "white" }}
                                >
                                    {expenseBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" wrapperStyle={{ color: "white" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;