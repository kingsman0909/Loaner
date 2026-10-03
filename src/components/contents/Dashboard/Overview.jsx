import React, { useState } from 'react';
import '../styles/overview.css';
import {
    FiDollarSign,
    FiUsers,
    FiAlertCircle,
    FiCreditCard,
    FiTrendingUp,
    FiClock,
    FiCheckCircle,
    FiFileText,
    FiArrowUpRight,
    FiArrowDownRight
} from 'react-icons/fi';

import ReuseTable from '../../ReusableTable/ReusableTable';

const Overview = () => {

    /*
    |--------------------------------------------------------------------------
    | PROXY DATA
    |--------------------------------------------------------------------------
    | Replace these later with API data.
    |--------------------------------------------------------------------------
    */

    const [member] = useState([
        {
            name: 'Cyrus Ken',
            loan: '₱5,000',
            overdue: false
        },
        {
            name: 'Cyron',
            loan: '₱10,000',
            overdue: true
        },
        {
            name: 'John Rafael',
            loan: '₱15,000',
            overdue: true
        },
        {
            name: 'Crystller',
            loan: '₱20,000',
            overdue: false
        },
        {
            name: 'Princess',
            loan: '₱50,000',
            overdue: true
        }
    ]);

    const [application] = useState([
        {
            name: 'Cyrus Ken',
            type: 'Medical',
            number: '09096068957'
        },
        {
            name: 'Cyron',
            type: 'Insurance',
            number: '09096068957'
        },
        {
            name: 'John Rafael',
            type: 'Personal',
            number: '09096068957'
        },
        {
            name: 'Crystller',
            type: 'Education',
            number: '09096068957'
        },
        {
            name: 'Princess',
            type: 'Living',
            number: '09096068957'
        }
    ]);

    /*
    |--------------------------------------------------------------------------
    | PROXY CHART DATA
    |--------------------------------------------------------------------------
    */

    const loanChart = [
        {
            month: 'Jan',
            value: 620000
        },
        {
            month: 'Feb',
            value: 780000
        },
        {
            month: 'Mar',
            value: 690000
        },
        {
            month: 'Apr',
            value: 920000
        },
        {
            month: 'May',
            value: 850000
        },
        {
            month: 'Jun',
            value: 1042500
        }
    ];

    const maxLoan = Math.max(
        ...loanChart.map(item => item.value)
    );

    /*
    |--------------------------------------------------------------------------
    | STATUS DATA
    |--------------------------------------------------------------------------
    */

    const statusData = [
        {
            label: 'Active',
            value: 42,
            percentage: 42,
            className: 'active'
        },
        {
            label: 'Pending',
            value: 21,
            percentage: 21,
            className: 'pending'
        },
        {
            label: 'Overdue',
            value: 18,
            percentage: 18,
            className: 'overdue'
        },
        {
            label: 'Paid',
            value: 13,
            percentage: 13,
            className: 'paid'
        },
        {
            label: 'Closed',
            value: 6,
            percentage: 6,
            className: 'closed'
        }
    ];

    return (
        <div className="overview">

            {/* =========================================================
                HEADER
            ========================================================= */}

            <div className="overview-header">

                <div>
                    <span className="overview-eyebrow">
                        LOAN MANAGEMENT
                    </span>

                    <h1>Dashboard Overview</h1>

                    <p>
                        Monitor your loan portfolio, borrowers,
                        applications and collections.
                    </p>
                </div>

                <div className="overview-date">
                    <FiClock />
                    <span>Updated today</span>
                </div>

            </div>


            {/* =========================================================
                KPI CARDS
            ========================================================= */}

            <div className="o-top">

                <div className="o-card">

                    <div className="o-card-top">

                        <div className="o-icon">
                            <FiDollarSign />
                        </div>

                        <span className="trend positive">
                            <FiArrowUpRight />
                            12.4%
                        </span>

                    </div>

                    <p>Total Loan</p>

                    <h2>₱1,042,500</h2>

                    <small>
                        Total released loan amount
                    </small>

                </div>


                <div className="o-card">

                    <div className="o-card-top">

                        <div className="o-icon">
                            <FiUsers />
                        </div>

                        <span className="trend positive">
                            <FiArrowUpRight />
                            8.2%
                        </span>

                    </div>

                    <p>Borrowers</p>

                    <h2>42</h2>

                    <small>
                        Active registered borrowers
                    </small>

                </div>


                <div className="o-card danger-card">

                    <div className="o-card-top">

                        <div className="o-icon danger">
                            <FiAlertCircle />
                        </div>

                        <span className="trend negative">
                            <FiArrowUpRight />
                            4.6%
                        </span>

                    </div>

                    <p>Overdue Loans</p>

                    <h2>18</h2>

                    <small>
                        Requires collection attention
                    </small>

                </div>


                <div className="o-card">

                    <div className="o-card-top">

                        <div className="o-icon">
                            <FiCreditCard />
                        </div>

                        <span className="trend positive">
                            <FiArrowUpRight />
                            5.8%
                        </span>

                    </div>

                    <p>Your Capital</p>

                    <h2>₱20M</h2>

                    <small>
                        Available lending capital
                    </small>

                </div>

            </div>


            {/* =========================================================
                CHART SECTION
            ========================================================= */}

            <div className="dashboard-grid">

                {/* LOAN PERFORMANCE */}

                <div className="dashboard-panel loan-performance">

                    <div className="panel-header">

                        <div>
                            <span className="panel-label">
                                PERFORMANCE
                            </span>

                            <h2>Loan Portfolio</h2>

                            <p>
                                Monthly loan amount released
                            </p>
                        </div>

                        <div className="chart-total">
                            <span>Total</span>
                            <strong>₱4.90M</strong>
                        </div>

                    </div>


                    <div className="bar-chart">

                        <div className="chart-y-axis">
                            <span>1.2M</span>
                            <span>900K</span>
                            <span>600K</span>
                            <span>300K</span>
                            <span>0</span>
                        </div>


                        <div className="chart-area">

                            <div className="chart-grid-lines">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>


                            <div className="bars">

                                {loanChart.map((item) => {

                                    const height =
                                        (item.value / maxLoan) * 100;

                                    return (
                                        <div
                                            className="bar-wrapper"
                                            key={item.month}
                                        >

                                            <div className="bar-value">
                                                ₱
                                                {(
                                                    item.value / 1000
                                                ).toFixed(0)}
                                                K
                                            </div>

                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${height}%`
                                                }}
                                            ></div>

                                            <span className="bar-label">
                                                {item.month}
                                            </span>

                                        </div>
                                    );

                                })}

                            </div>

                        </div>

                    </div>

                </div>


                {/* LOAN STATUS */}

                <div className="dashboard-panel status-panel">

                    <div className="panel-header">

                        <div>
                            <span className="panel-label">
                                PORTFOLIO
                            </span>

                            <h2>Loan Status</h2>

                            <p>
                                Current loan distribution
                            </p>
                        </div>

                    </div>


                    <div className="status-content">

                        <div className="donut-wrapper">

                            <div
                                className="donut"
                                style={{
                                    background: `
                                        conic-gradient(
                                            #164931 0% 42%,
                                            #d6a84f 42% 63%,
                                            #d9534f 63% 81%,
                                            #4f9d69 81% 94%,
                                            #777 94% 100%
                                        )
                                    `
                                }}
                            >

                                <div className="donut-center">
                                    <strong>100</strong>
                                    <span>Loans</span>
                                </div>

                            </div>

                        </div>


                        <div className="status-list">

                            {statusData.map((item) => (

                                <div
                                    className="status-row"
                                    key={item.label}
                                >

                                    <div className="status-name">

                                        <span
                                            className={`status-dot ${item.className}`}
                                        ></span>

                                        <span>
                                            {item.label}
                                        </span>

                                    </div>

                                    <div className="status-number">

                                        <strong>
                                            {item.value}
                                        </strong>

                                        <span>
                                            {item.percentage}%
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================================================
                SECONDARY STATISTICS
            ========================================================= */}

            <div className="quick-stats">

                <div className="quick-stat">

                    <div className="quick-stat-icon">
                        <FiTrendingUp />
                    </div>

                    <div>
                        <span>Collection Rate</span>
                        <strong>86.4%</strong>
                    </div>

                    <small className="positive-text">
                        +3.2%
                    </small>

                </div>


                <div className="quick-stat">

                    <div className="quick-stat-icon">
                        <FiCheckCircle />
                    </div>

                    <div>
                        <span>Paid Loans</span>
                        <strong>64</strong>
                    </div>

                    <small className="positive-text">
                        +8 this month
                    </small>

                </div>


                <div className="quick-stat">

                    <div className="quick-stat-icon warning">
                        <FiAlertCircle />
                    </div>

                    <div>
                        <span>Overdue Amount</span>
                        <strong>₱184,500</strong>
                    </div>

                    <small className="negative-text">
                        Needs attention
                    </small>

                </div>


                <div className="quick-stat">

                    <div className="quick-stat-icon">
                        <FiFileText />
                    </div>

                    <div>
                        <span>Applications</span>
                        <strong>27</strong>
                    </div>

                    <small>
                        5 new today
                    </small>

                </div>

            </div>


            {/* =========================================================
                TABLES
            ========================================================= */}

            <div className="tables-grid">

                {/* OVERDUE */}

                <div className="dashboard-panel table-panel">

                    <div className="panel-header">

                        <div>
                            <span className="panel-label danger-label">
                                COLLECTION
                            </span>

                            <h2>Overdue Loans</h2>

                            <p>
                                Borrowers requiring attention
                            </p>
                        </div>

                        <button className="view-button">
                            View All
                            <FiArrowUpRight />
                        </button>

                    </div>

                    <ReuseTable data={member} />

                </div>


                {/* APPLICATIONS */}

                <div className="dashboard-panel table-panel">

                    <div className="panel-header">

                        <div>
                            <span className="panel-label">
                                APPLICATIONS
                            </span>

                            <h2>Recent Applicants</h2>

                            <p>
                                Latest loan applications
                            </p>
                        </div>

                        <button className="view-button">
                            View All
                            <FiArrowUpRight />
                        </button>

                    </div>

                    <ReuseTable data={application} />

                </div>

            </div>

        </div>
    );
};

export default Overview;