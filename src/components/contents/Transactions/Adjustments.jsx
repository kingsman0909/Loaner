import React, { useEffect, useState } from 'react';
import '../styles/transaction.css';
import { API_BASE_URL } from '../../../config';

const Adjustments = () => {
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const loanerToken = localStorage.getItem('loaner_token');

    const fetchAdjustments = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/transactions/adjustments?filter=${filter}`,
                {
                    headers: {
                        Authorization: `Bearer ${loanerToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch adjustments');
            }

            const data = await response.json();
            setAdjustments(data || []);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdjustments();
    }, [filter]);

    const filteredAdjustments = adjustments.filter((item) => {
        const name = `${item.firstname || ''} ${item.lastname || ''}`.toLowerCase();
        return name.includes(search.toLowerCase());
    });

    return (
        <div className="transaction-page">
            <div className="transaction-header">
                <div>
                    <h1>Adjustments</h1>
                    <p>Review loan adjustments, penalties, and miscellaneous charges.</p>
                </div>
                <div className="transaction-count">
                    {adjustments.length} Adjustments
                </div>
            </div>

            <div className="transaction-toolbar">
                <input
                    type="text"
                    placeholder="Search member..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="transaction-search-input"
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="transaction-filter"
                >
                    <option value="all">All Types</option>
                    <option value="penalty">Penalty</option>
                    <option value="charge">Charge</option>
                    <option value="waiver">Waiver</option>
                    <option value="discount">Discount</option>
                </select>
            </div>

            <div className="transaction-table-wrapper">
                {loading ? (
                    <div className="transaction-empty">
                        <div className="transaction-spinner"></div>
                        <p>Loading adjustments...</p>
                    </div>
                ) : filteredAdjustments.length === 0 ? (
                    <div className="transaction-empty">
                        <h3>No Adjustments Found</h3>
                        <p>There are no adjustments matching your criteria.</p>
                    </div>
                ) : (
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Loan ID</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Reason</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAdjustments.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="transaction-member">
                                            <div className="transaction-avatar">
                                                {item.firstname?.charAt(0)}
                                                {item.lastname?.charAt(0)}
                                            </div>
                                            <div>
                                                <strong>
                                                    {item.firstname} {item.lastname}
                                                </strong>
                                                <span>{item.member_id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{item.loan_id || '-'}</td>
                                    <td>
                                        <span
                                            className={`transaction-badge ${
                                                item.type || 'charge'
                                            }`}
                                        >
                                            {item.type || 'Charge'}
                                        </span>
                                    </td>
                                    <td className={
                                        item.type === 'discount' || item.type === 'waiver'
                                            ? 'transaction-waiver'
                                            : 'transaction-money'
                                    }>
                                        {item.type === 'discount' || item.type === 'waiver'
                                            ? '-'
                                            : '+'}
                                        ₱{Number(
                                            item.amount || 0
                                        ).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className="transaction-reason">
                                        {item.reason || '-'}
                                    </td>
                                    <td>{item.adjustment_date || '-'}</td>
                                    <td>
                                        <span
                                            className={`transaction-status ${
                                                item.status || 'pending'
                                            }`}
                                        >
                                            {item.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="transaction-action-btn">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Adjustments;
