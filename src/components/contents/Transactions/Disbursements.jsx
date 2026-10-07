import React, { useEffect, useState } from 'react';
import '../styles/transaction.css';
import { API_BASE_URL } from '../../../config';

const Disbursements = () => {
    const [disbursements, setDisbursements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const loanerToken = localStorage.getItem('loaner_token');

    const fetchDisbursements = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/transactions/disbursements?filter=${filter}`,
                {
                    headers: {
                        Authorization: `Bearer ${loanerToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch disbursements');
            }

            const data = await response.json();
            setDisbursements(data || []);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisbursements();
    }, [filter]);

    const filteredDisbursements = disbursements.filter((item) => {
        const name = `${item.firstname || ''} ${item.lastname || ''}`.toLowerCase();
        return name.includes(search.toLowerCase());
    });

    return (
        <div className="transaction-page">
            <div className="transaction-header">
                <div>
                    <h1>Disbursements</h1>
                    <p>Monitor all loan disbursement transactions and records.</p>
                </div>
                <div className="transaction-count">
                    {disbursements.length} Disbursements
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
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="transaction-table-wrapper">
                {loading ? (
                    <div className="transaction-empty">
                        <div className="transaction-spinner"></div>
                        <p>Loading disbursements...</p>
                    </div>
                ) : filteredDisbursements.length === 0 ? (
                    <div className="transaction-empty">
                        <h3>No Disbursements Found</h3>
                        <p>There are no disbursements matching your criteria.</p>
                    </div>
                ) : (
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Loan Amount</th>
                                <th>Disbursed Amount</th>
                                <th>Disbursement Date</th>
                                <th>Release Method</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDisbursements.map((item) => (
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
                                    <td className="transaction-money">
                                        ₱{Number(
                                            item.loan_amount || 0
                                        ).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className="transaction-success">
                                        ₱{Number(
                                            item.disbursed_amount || 0
                                        ).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td>{item.disbursement_date || '-'}</td>
                                    <td>{item.release_method || '-'}</td>
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

export default Disbursements;
