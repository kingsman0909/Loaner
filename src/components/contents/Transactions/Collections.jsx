import React, { useEffect, useState } from 'react';
import '../styles/transaction.css';
import { API_BASE_URL } from '../../../config';

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const loanerToken = localStorage.getItem('loaner_token');

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${API_BASE_URL}/transactions/collections?filter=${filter}`,
                {
                    headers: {
                        Authorization: `Bearer ${loanerToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch collections');
            }

            const data = await response.json();
            setCollections(data || []);
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, [filter]);

    const filteredCollections = collections.filter((item) => {
        const name = `${item.firstname || ''} ${item.lastname || ''}`.toLowerCase();
        return name.includes(search.toLowerCase());
    });

    return (
        <div className="transaction-page">
            <div className="transaction-header">
                <div>
                    <h1>Collections</h1>
                    <p>Track and manage payment collections from borrowers.</p>
                </div>
                <div className="transaction-count">
                    {collections.length} Collections
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
                    <option value="received">Received</option>
                    <option value="partial">Partial</option>
                </select>
            </div>

            <div className="transaction-table-wrapper">
                {loading ? (
                    <div className="transaction-empty">
                        <div className="transaction-spinner"></div>
                        <p>Loading collections...</p>
                    </div>
                ) : filteredCollections.length === 0 ? (
                    <div className="transaction-empty">
                        <h3>No Collections Found</h3>
                        <p>There are no collections matching your criteria.</p>
                    </div>
                ) : (
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Loan ID</th>
                                <th>Amount Due</th>
                                <th>Amount Received</th>
                                <th>Collection Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCollections.map((item) => (
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
                                    <td className="transaction-money">
                                        ₱{Number(
                                            item.amount_due || 0
                                        ).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td className="transaction-success">
                                        ₱{Number(
                                            item.amount_received || 0
                                        ).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </td>
                                    <td>{item.collection_date || '-'}</td>
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

export default Collections;
