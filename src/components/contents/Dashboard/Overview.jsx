import React, { useEffect, useMemo, useState } from 'react';

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
    FiArrowDownRight,
    FiRefreshCw,
    FiActivity,
    FiShield,
    FiPercent,
    FiLoader
} from 'react-icons/fi';

import ReuseTable from '../../ReusableTable/ReusableTable';


// ============================================================
// API
// ============================================================

const API_BASE_URL =
    'http://localhost:3000/api/auth';


// ============================================================
// HELPERS
// ============================================================

const formatMoney = (value) => {

    const number = Number(value || 0);

    return new Intl.NumberFormat(
        'en-PH',
        {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 2
        }
    ).format(number);
};


const formatCompactMoney = (value) => {

    const number = Number(value || 0);

    if (number >= 1000000) {
        return `₱${(number / 1000000).toFixed(2)}M`;
    }

    if (number >= 1000) {
        return `₱${(number / 1000).toFixed(1)}K`;
    }

    return `₱${number.toFixed(0)}`;
};


const formatPercent = (value) => {

    const number = Number(value || 0);

    return `${number.toFixed(1)}%`;
};


const getFullName = (loan) => {

    if (loan.member_name) {
        return loan.member_name;
    }

    if (loan.full_name) {
        return loan.full_name;
    }

    return [
        loan.firstname,
        loan.lastname
    ]
        .filter(Boolean)
        .join(' ') || 'Unknown Member';
};


const getDateValue = (loan) => {

    return (
        loan.releaseDate ||
        loan.release_date ||
        loan.created_at ||
        loan.createdAt ||
        loan.date_created ||
        null
    );
};


const formatDate = (date) => {

    if (!date) {
        return '-';
    }

    const parsed =
        new Date(date);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return '-';
    }

    return parsed.toLocaleDateString(
        'en-PH',
        {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }
    );
};


const getStatus = (loan) => {

    return String(
        loan.status || 'unknown'
    ).toLowerCase();
};


// ============================================================
// FETCH ALL PAGINATED LOANS
// ============================================================

const fetchAllLoans = async (
    token
) => {

    const allLoans = [];

    let offset = 0;

    const limit = 100;

    let total = Infinity;


    while (
        allLoans.length < total
    ) {

        const response =
            await fetch(
                `${API_BASE_URL}/loans?limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            const error =
                await response.json()
                    .catch(() => ({}));

            throw new Error(
                error.message ||
                'Unable to load loans'
            );
        }


        const result =
            await response.json();


        const rows =
            Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.loans)
                    ? result.loans
                    : [];


        const pagination =
            result.pagination || {};


        total =
            Number(
                pagination.total ||
                result.total ||
                rows.length
            );


        allLoans.push(
            ...rows
        );


        if (
            rows.length === 0
        ) {
            break;
        }


        offset += rows.length;


        if (
            rows.length < limit
        ) {
            break;
        }
    }


    return allLoans;
};


// ============================================================
// FETCH MEMBERS
// ============================================================

const fetchAllMembers = async (
    token
) => {

    const allMembers = [];

    let page = 1;

    const limit = 100;

    let total = Infinity;


    while (
        allMembers.length < total
    ) {

        const response =
            await fetch(
                `${API_BASE_URL}/members?page=${page}&limit=${limit}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            const error =
                await response.json()
                    .catch(() => ({}));

            throw new Error(
                error.message ||
                'Unable to load members'
            );
        }


        const result =
            await response.json();


        const rows =
            Array.isArray(result.members)
                ? result.members
                : Array.isArray(result.data)
                    ? result.data
                    : [];


        total =
            Number(
                result.total ||
                result.pagination?.total ||
                rows.length
            );


        allMembers.push(
            ...rows
        );


        if (
            rows.length === 0
        ) {
            break;
        }


        if (
            rows.length < limit
        ) {
            break;
        }


        page++;
    }


    return allMembers;
};


// ============================================================
// OVERVIEW
// ============================================================

const Overview = () => {

    const [loans, setLoans] =
        useState([]);

    const [members, setMembers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [lastUpdated, setLastUpdated] =
        useState(null);


    // ========================================================
    // LOAD DASHBOARD
    // ========================================================

    const loadDashboard = async () => {

        try {

            setLoading(true);

            setError('');


            const token =
                localStorage.getItem(
                    'loaner_token'
                );


            if (!token) {

                throw new Error(
                    'Authentication token not found. Please login again.'
                );
            }


            const [
                loansData,
                membersData
            ] =
                await Promise.all([
                    fetchAllLoans(token),
                    fetchAllMembers(token)
                ]);


            setLoans(
                loansData
            );

            setMembers(
                membersData
            );


            setLastUpdated(
                new Date()
            );

        } catch (err) {

            console.error(
                'DASHBOARD ERROR:',
                err
            );


            setError(
                err.message ||
                'Unable to load dashboard data'
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadDashboard();

    }, []);


    // ========================================================
    // CALCULATE STATISTICS
    // ========================================================

    const statistics =
        useMemo(() => {

            const totalLoans =
                loans.length;


            const activeLoans =
                loans.filter(
                    loan =>
                        getStatus(loan) ===
                        'active'
                );


            const pendingLoans =
                loans.filter(
                    loan =>
                        getStatus(loan) ===
                        'pending'
                );


            const overdueLoans =
                loans.filter(
                    loan =>
                        getStatus(loan) ===
                        'overdue'
                );


            const paidLoans =
                loans.filter(
                    loan =>
                        getStatus(loan) ===
                        'paid'
                );


            const closedLoans =
                loans.filter(
                    loan =>
                        getStatus(loan) ===
                        'closed'
                );


            // ------------------------------------------------
            // MONEY
            // ------------------------------------------------

            const totalReleased =
                loans.reduce(
                    (
                        total,
                        loan
                    ) =>
                        total +
                        Number(
                            loan.principalAmount ||
                            0
                        ),
                    0
                );


            const totalDue =
                loans.reduce(
                    (
                        total,
                        loan
                    ) =>
                        total +
                        Number(
                            loan.totalDue ||
                            0
                        ),
                    0
                );


            const totalPaid =
                loans.reduce(
                    (
                        total,
                        loan
                    ) =>
                        total +
                        Number(
                            loan.total_paid ||
                            loan.totalPaid ||
                            0
                        ),
                    0
                );


            const totalRemaining =
                loans.reduce(
                    (
                        total,
                        loan
                    ) =>
                        total +
                        Number(
                            loan.remaining_balance ||
                            loan.remainingBalance ||
                            Math.max(
                                Number(
                                    loan.totalDue ||
                                    0
                                ) -
                                Number(
                                    loan.total_paid ||
                                    0
                                ),
                                0
                            )
                        ),
                    0
                );


            const overdueAmount =
                overdueLoans.reduce(
                    (
                        total,
                        loan
                    ) =>
                        total +
                        Number(
                            loan.remaining_balance ||
                            loan.remainingBalance ||
                            0
                        ),
                    0
                );


            const averageLoan =
                totalLoans > 0
                    ? totalReleased /
                      totalLoans
                    : 0;


            const averageOutstanding =
                totalLoans > 0
                    ? totalRemaining /
                      totalLoans
                    : 0;


            // ------------------------------------------------
            // RATIOS
            // ------------------------------------------------

            const collectionRate =
                totalDue > 0
                    ? (
                        totalPaid /
                        totalDue
                    ) *
                    100
                    : 0;


            const overdueRate =
                totalLoans > 0
                    ? (
                        overdueLoans.length /
                        totalLoans
                    ) *
                    100
                    : 0;


            const repaymentRate =
                totalLoans > 0
                    ? (
                        (
                            paidLoans.length +
                            closedLoans.length
                        ) /
                        totalLoans
                    ) *
                    100
                    : 0;


            const pendingRate =
                totalLoans > 0
                    ? (
                        pendingLoans.length /
                        totalLoans
                    ) *
                    100
                    : 0;


            const activeRate =
                totalLoans > 0
                    ? (
                        activeLoans.length /
                        totalLoans
                    ) *
                    100
                    : 0;


            // ------------------------------------------------
            // PORTFOLIO RISK
            // ------------------------------------------------

            let riskLevel =
                'Low';


            if (
                overdueRate >= 20
            ) {

                riskLevel =
                    'High';

            } else if (
                overdueRate >= 10
            ) {

                riskLevel =
                    'Moderate';
            }


            // ------------------------------------------------
            // MEMBER STATS
            // ------------------------------------------------

            const totalMembers =
                members.length;


            const approvedMembers =
                members.filter(
                    member =>
                        String(
                            member.status || ''
                        ).toLowerCase() ===
                        'approved'
                ).length;


            const pendingMembers =
                members.filter(
                    member =>
                        String(
                            member.status || ''
                        ).toLowerCase() ===
                        'pending'
                ).length;


            const memberApprovalRate =
                totalMembers > 0
                    ? (
                        approvedMembers /
                        totalMembers
                    ) *
                    100
                    : 0;


            // ------------------------------------------------
            // MONTHLY RELEASES
            // ------------------------------------------------

            const now =
                new Date();


            const monthlyMap =
                {};


            for (
                let i = 5;
                i >= 0;
                i--
            ) {

                const date =
                    new Date(
                        now.getFullYear(),
                        now.getMonth() - i,
                        1
                    );


                const key =
                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, '0')}`;


                monthlyMap[key] = {

                    month:
                        date.toLocaleDateString(
                            'en-PH',
                            {
                                month: 'short'
                            }
                        ),

                    value: 0,

                    count: 0
                };
            }


            loans.forEach(
                loan => {

                    const dateValue =
                        getDateValue(
                            loan
                        );


                    if (!dateValue) {
                        return;
                    }


                    const date =
                        new Date(
                            dateValue
                        );


                    if (
                        Number.isNaN(
                            date.getTime()
                        )
                    ) {
                        return;
                    }


                    const key =
                        `${date.getFullYear()}-${String(
                            date.getMonth() + 1
                        ).padStart(2, '0')}`;


                    if (
                        monthlyMap[key]
                    ) {

                        monthlyMap[key].value +=
                            Number(
                                loan.principalAmount ||
                                0
                            );


                        monthlyMap[key].count++;
                    }
                }
            );


            const monthlyLoans =
                Object.values(
                    monthlyMap
                );


            // ------------------------------------------------
            // STATUS DATA
            // ------------------------------------------------

            const statusData = [

                {
                    label: 'Active',
                    value: activeLoans.length,
                    className: 'active'
                },

                {
                    label: 'Pending',
                    value: pendingLoans.length,
                    className: 'pending'
                },

                {
                    label: 'Overdue',
                    value: overdueLoans.length,
                    className: 'overdue'
                },

                {
                    label: 'Paid',
                    value: paidLoans.length,
                    className: 'paid'
                },

                {
                    label: 'Closed',
                    value: closedLoans.length,
                    className: 'closed'
                }

            ].map(
                item => ({

                    ...item,

                    percentage:
                        totalLoans > 0
                            ? (
                                item.value /
                                totalLoans
                            ) *
                            100
                            : 0

                })
            );


            return {

                totalLoans,

                activeLoans,

                pendingLoans,

                overdueLoans,

                paidLoans,

                closedLoans,

                totalReleased,

                totalDue,

                totalPaid,

                totalRemaining,

                overdueAmount,

                averageLoan,

                averageOutstanding,

                collectionRate,

                overdueRate,

                repaymentRate,

                pendingRate,

                activeRate,

                riskLevel,

                totalMembers,

                approvedMembers,

                pendingMembers,

                memberApprovalRate,

                monthlyLoans,

                statusData

            };

        }, [loans, members]);


    // ========================================================
    // CHART
    // ========================================================

    const maxLoan =
        Math.max(
            ...statistics.monthlyLoans.map(
                item =>
                    item.value
            ),
            1
        );


    // ========================================================
    // TABLE DATA
    // ========================================================

    const overdueTable =
        useMemo(() => {

            return statistics
                .overdueLoans
                .slice(0, 5)
                .map(
                    loan => ({

                        name:
                            getFullName(
                                loan
                            ),

                        loan:
                            formatMoney(
                                loan.remaining_balance ||
                                loan.remainingBalance ||
                                0
                            ),

                        overdue:
                            true

                    })
                );

        }, [
            statistics.overdueLoans
        ]);


    const pendingTable =
        useMemo(() => {

            return members
                .filter(
                    member =>
                        String(
                            member.status || ''
                        ).toLowerCase() ===
                        'pending'
                )
                .slice(0, 5)
                .map(
                    member => ({

                        name:
                            [
                                member.firstname,
                                member.lastname
                            ]
                                .filter(Boolean)
                                .join(' ') ||
                            'Unknown Member',

                        type:
                            member.source_of_income ||
                            'Member Application',

                        number:
                            member.contact ||
                            '-'

                    })
                );

        }, [members]);


    // ========================================================
    // DONUT
    // ========================================================

    const donutGradient =
        useMemo(() => {

            const colors = [

                '#164931',

                '#d6a84f',

                '#d9534f',

                '#4f9d69',

                '#777'

            ];


            let current =
                0;


            const segments =
                statistics.statusData
                    .map(
                        (
                            item,
                            index
                        ) => {

                            const start =
                                current;


                            current +=
                                item.percentage;


                            return `${colors[index]} ${start}% ${current}%`;

                        }
                    );


            if (
                current === 0
            ) {

                return `
                    conic-gradient(
                        #333 0% 100%
                    )
                `;
            }


            return `
                conic-gradient(
                    ${segments.join(',')}
                )
            `;

        }, [
            statistics.statusData
        ]);


    // ========================================================
    // LOADING
    // ========================================================

    if (
        loading
    ) {

        return (

            <div className="overview">

                <div className="overview-loading">

                    <FiLoader
                        className="loading-icon"
                    />

                    <h2>
                        Loading dashboard...
                    </h2>

                    <p>
                        Fetching your real loan
                        and member data.
                    </p>

                </div>

            </div>

        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (
        error
    ) {

        return (

            <div className="overview">

                <div className="overview-error">

                    <FiAlertCircle />

                    <div>

                        <h2>
                            Unable to load dashboard
                        </h2>

                        <p>
                            {error}
                        </p>

                    </div>

                    <button
                        onClick={
                            loadDashboard
                        }
                    >

                        <FiRefreshCw />

                        Retry

                    </button>

                </div>

            </div>

        );
    }


    // ========================================================
    // UI
    // ========================================================

    return (

        <div className="overview">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="overview-header">

                <div>

                    <span className="overview-eyebrow">
                        LOAN MANAGEMENT
                    </span>

                    <h1>
                        Dashboard Overview
                    </h1>

                    <p>
                        Real-time summary of your
                        borrowers, loans and collections.
                    </p>

                </div>


                <div className="overview-header-actions">

                    <div className="overview-date">

                        <FiClock />

                        <span>

                            {lastUpdated
                                ? `Updated ${lastUpdated.toLocaleTimeString(
                                    'en-PH',
                                    {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }
                                )}`
                                : 'Updated now'}

                        </span>

                    </div>


                    <button
                        className="refresh-button"
                        onClick={
                            loadDashboard
                        }
                    >

                        <FiRefreshCw />

                        Refresh

                    </button>

                </div>

            </div>


            {/* =================================================
                MAIN KPI
            ================================================= */}

            <div className="o-top">


                {/* TOTAL RELEASED */}

                <div className="o-card">

                    <div className="o-card-top">

                        <div className="o-icon">

                            <FiDollarSign />

                        </div>

                        <span className="trend positive">

                            <FiArrowUpRight />

                            Portfolio

                        </span>

                    </div>


                    <p>
                        Total Released
                    </p>


                    <h2>
                        {formatCompactMoney(
                            statistics.totalReleased
                        )}
                    </h2>


                    <small>
                        {statistics.totalLoans}
                        {' '}
                        total loans
                    </small>

                </div>


                {/* BORROWERS */}

                <div className="o-card">

                    <div className="o-card-top">

                        <div className="o-icon">

                            <FiUsers />

                        </div>

                        <span className="trend positive">

                            <FiArrowUpRight />

                            {formatPercent(
                                statistics.memberApprovalRate
                            )}

                        </span>

                    </div>


                    <p>
                        Borrowers
                    </p>


                    <h2>
                        {statistics.totalMembers}
                    </h2>


                    <small>

                        {statistics.approvedMembers}
                        {' '}
                        approved members

                    </small>

                </div>


                {/* OVERDUE */}

                <div className="o-card danger-card">

                    <div className="o-card-top">

                        <div className="o-icon danger">

                            <FiAlertCircle />

                        </div>


                        <span
                            className={
                                statistics.overdueRate >= 10
                                    ? 'trend negative'
                                    : 'trend positive'
                            }
                        >

                            {statistics.overdueRate >= 10
                                ? <FiArrowUpRight />
                                : <FiArrowDownRight />
                            }

                            {formatPercent(
                                statistics.overdueRate
                            )}

                        </span>

                    </div>


                    <p>
                        Overdue Loans
                    </p>


                    <h2>
                        {statistics.overdueLoans.length}
                    </h2>


                    <small>

                        {formatMoney(
                            statistics.overdueAmount
                        )}
                        {' '}
                        outstanding

                    </small>

                </div>


                {/* OUTSTANDING */}

                <div className="o-card">

                    <div className="o-card-top">

                        <div className="o-icon">

                            <FiCreditCard />

                        </div>


                        <span className="trend">

                            <FiActivity />

                            {formatPercent(
                                statistics.collectionRate
                            )}

                        </span>

                    </div>


                    <p>
                        Outstanding
                    </p>


                    <h2>
                        {formatCompactMoney(
                            statistics.totalRemaining
                        )}
                    </h2>


                    <small>
                        {formatPercent(
                            statistics.collectionRate
                        )}
                        {' '}
                        collection rate
                    </small>

                </div>

            </div>


            {/* =================================================
                PROBABILITY / RISK CARDS
            ================================================= */}

            <div className="probability-grid">


                <div className="probability-card">

                    <div className="probability-icon">

                        <FiCheckCircle />

                    </div>


                    <div className="probability-content">

                        <span>
                            Repayment Probability
                        </span>

                        <strong>
                            {formatPercent(
                                statistics.repaymentRate
                            )}
                        </strong>

                        <small>
                            Loans already paid or closed
                        </small>

                    </div>

                </div>


                <div className="probability-card">

                    <div className="probability-icon warning">

                        <FiAlertCircle />

                    </div>


                    <div className="probability-content">

                        <span>
                            Overdue Probability
                        </span>

                        <strong>
                            {formatPercent(
                                statistics.overdueRate
                            )}
                        </strong>

                        <small>
                            Historical overdue share
                        </small>

                    </div>

                </div>


                <div className="probability-card">

                    <div className="probability-icon">

                        <FiFileText />

                    </div>


                    <div className="probability-content">

                        <span>
                            Pending Probability
                        </span>

                        <strong>
                            {formatPercent(
                                statistics.pendingRate
                            )}
                        </strong>

                        <small>
                            Loans currently pending
                        </small>

                    </div>

                </div>


                <div className="probability-card">

                    <div
                        className={
                            `probability-icon ${
                                statistics.riskLevel === 'High'
                                    ? 'danger'
                                    : statistics.riskLevel === 'Moderate'
                                        ? 'warning'
                                        : ''
                            }`
                        }
                    >

                        <FiShield />

                    </div>


                    <div className="probability-content">

                        <span>
                            Portfolio Risk
                        </span>

                        <strong>
                            {statistics.riskLevel}
                        </strong>

                        <small>
                            Based on overdue ratio
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================================
                PORTFOLIO STATISTICS
            ================================================= */}

            <div className="mini-stat-grid">


                <div className="mini-stat">

                    <FiDollarSign />

                    <div>

                        <span>
                            Average Loan
                        </span>

                        <strong>
                            {formatMoney(
                                statistics.averageLoan
                            )}
                        </strong>

                    </div>

                </div>


                <div className="mini-stat">

                    <FiCreditCard />

                    <div>

                        <span>
                            Average Outstanding
                        </span>

                        <strong>
                            {formatMoney(
                                statistics.averageOutstanding
                            )}
                        </strong>

                    </div>

                </div>


                <div className="mini-stat">

                    <FiTrendingUp />

                    <div>

                        <span>
                            Total Collected
                        </span>

                        <strong>
                            {formatCompactMoney(
                                statistics.totalPaid
                            )}
                        </strong>

                    </div>

                </div>


                <div className="mini-stat">

                    <FiPercent />

                    <div>

                        <span>
                            Member Approval
                        </span>

                        <strong>
                            {formatPercent(
                                statistics.memberApprovalRate
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                CHART + STATUS
            ================================================= */}

            <div className="dashboard-grid">


                {/* LOAN PERFORMANCE */}

                <div className="dashboard-panel loan-performance">

                    <div className="panel-header">

                        <div>

                            <span className="panel-label">
                                PERFORMANCE
                            </span>

                            <h2>
                                Loan Portfolio
                            </h2>

                            <p>
                                Actual loan amounts released
                                during the last six months.
                            </p>

                        </div>


                        <div className="chart-total">

                            <span>
                                Total Released
                            </span>

                            <strong>
                                {formatCompactMoney(
                                    statistics.totalReleased
                                )}
                            </strong>

                        </div>

                    </div>


                    <div className="bar-chart">

                        <div className="chart-y-axis">

                            <span>
                                {formatCompactMoney(
                                    maxLoan
                                )}
                            </span>

                            <span>
                                {formatCompactMoney(
                                    maxLoan * 0.75
                                )}
                            </span>

                            <span>
                                {formatCompactMoney(
                                    maxLoan * 0.5
                                )}
                            </span>

                            <span>
                                {formatCompactMoney(
                                    maxLoan * 0.25
                                )}
                            </span>

                            <span>
                                0
                            </span>

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

                                {statistics.monthlyLoans.map(
                                    item => {

                                        const height =
                                            item.value > 0
                                                ? (
                                                    item.value /
                                                    maxLoan
                                                ) *
                                                100
                                                : 0;


                                        return (

                                            <div
                                                className="bar-wrapper"
                                                key={
                                                    item.month
                                                }
                                            >

                                                <div className="bar-value">

                                                    {formatCompactMoney(
                                                        item.value
                                                    )}

                                                </div>


                                                <div
                                                    className="bar"
                                                    style={{
                                                        height:
                                                            `${height}%`
                                                    }}
                                                    title={
                                                        `${item.count} loan(s) - ${formatMoney(
                                                            item.value
                                                        )}`
                                                    }
                                                ></div>


                                                <span className="bar-label">

                                                    {item.month}

                                                </span>

                                            </div>

                                        );

                                    }
                                )}

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

                            <h2>
                                Loan Status
                            </h2>

                            <p>
                                Current distribution
                                of all loans.
                            </p>

                        </div>

                    </div>


                    <div className="status-content">

                        <div className="donut-wrapper">

                            <div
                                className="donut"
                                style={{
                                    background:
                                        donutGradient
                                }}
                            >

                                <div className="donut-center">

                                    <strong>
                                        {statistics.totalLoans}
                                    </strong>

                                    <span>
                                        Loans
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="status-list">

                            {statistics.statusData.map(
                                item => (

                                    <div
                                        className="status-row"
                                        key={
                                            item.label
                                        }
                                    >

                                        <div className="status-name">

                                            <span
                                                className={
                                                    `status-dot ${item.className}`
                                                }
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
                                                {formatPercent(
                                                    item.percentage
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                SECONDARY STATISTICS
            ================================================= */}

            <div className="quick-stats">


                <div className="quick-stat">

                    <div className="quick-stat-icon">

                        <FiTrendingUp />

                    </div>


                    <div>

                        <span>
                            Collection Rate
                        </span>

                        <strong>
                            {formatPercent(
                                statistics.collectionRate
                            )}
                        </strong>

                    </div>


                    <small
                        className={
                            statistics.collectionRate >= 80
                                ? 'positive-text'
                                : 'negative-text'
                        }
                    >

                        {statistics.collectionRate >= 80
                            ? 'Healthy'
                            : 'Needs attention'}

                    </small>

                </div>


                <div className="quick-stat">

                    <div className="quick-stat-icon">

                        <FiCheckCircle />

                    </div>


                    <div>

                        <span>
                            Paid Loans
                        </span>

                        <strong>
                            {statistics.paidLoans.length}
                        </strong>

                    </div>


                    <small className="positive-text">

                        {formatPercent(
                            statistics.repaymentRate
                        )}
                        {' '}
                        repayment rate

                    </small>

                </div>


                <div className="quick-stat">

                    <div className="quick-stat-icon warning">

                        <FiAlertCircle />

                    </div>


                    <div>

                        <span>
                            Overdue Amount
                        </span>

                        <strong>
                            {formatCompactMoney(
                                statistics.overdueAmount
                            )}
                        </strong>

                    </div>


                    <small className="negative-text">

                        {statistics.overdueLoans.length}
                        {' '}
                        overdue loans

                    </small>

                </div>


                <div className="quick-stat">

                    <div className="quick-stat-icon">

                        <FiFileText />

                    </div>


                    <div>

                        <span>
                            Pending Applications
                        </span>

                        <strong>
                            {statistics.pendingMembers}
                        </strong>

                    </div>


                    <small>

                        {formatPercent(
                            statistics.memberApprovalRate
                        )}
                        {' '}
                        approval rate

                    </small>

                </div>

            </div>


            {/* =================================================
                TABLES
            ================================================= */}

            <div className="tables-grid">


                {/* OVERDUE */}

                <div className="dashboard-panel table-panel">

                    <div className="panel-header">

                        <div>

                            <span className="panel-label danger-label">
                                COLLECTION
                            </span>

                            <h2>
                                Overdue Loans
                            </h2>

                            <p>
                                Members requiring collection
                                attention.
                            </p>

                        </div>


                        <button
                            className="view-button"
                            onClick={() =>
                                window.dispatchEvent(
                                    new CustomEvent(
                                        'navigate-loans',
                                        {
                                            detail: {
                                                status:
                                                    'overdue'
                                            }
                                        }
                                    )
                                )
                            }
                        >

                            View All

                            <FiArrowUpRight />

                        </button>

                    </div>


                    {overdueTable.length > 0 ? (

                        <ReuseTable
                            data={
                                overdueTable
                            }
                        />

                    ) : (

                        <div className="empty-dashboard">

                            <FiCheckCircle />

                            <span>
                                No overdue loans
                            </span>

                        </div>

                    )}

                </div>


                {/* APPLICATIONS */}

                <div className="dashboard-panel table-panel">

                    <div className="panel-header">

                        <div>

                            <span className="panel-label">
                                APPLICATIONS
                            </span>

                            <h2>
                                Pending Members
                            </h2>

                            <p>
                                Members waiting for approval.
                            </p>

                        </div>


                        <button
                            className="view-button"
                            onClick={() =>
                                window.dispatchEvent(
                                    new CustomEvent(
                                        'navigate-members',
                                        {
                                            detail: {
                                                status:
                                                    'pending'
                                            }
                                        }
                                    )
                                )
                            }
                        >

                            View All

                            <FiArrowUpRight />

                        </button>

                    </div>


                    {pendingTable.length > 0 ? (

                        <ReuseTable
                            data={
                                pendingTable
                            }
                        />

                    ) : (

                        <div className="empty-dashboard">

                            <FiCheckCircle />

                            <span>
                                No pending applications
                            </span>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};


export default Overview;