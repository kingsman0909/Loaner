import React, { useEffect, useState } from 'react';
import '../styles/transaction.css';
import { API_BASE_URL } from '../../../config';

const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedCollection, setSelectedCollection] = useState(null);

    const loanerToken = localStorage.getItem('loaner_token');
    const loanerData = localStorage.getItem('loaner');
    const loaner_id = JSON.parse(loanerData)?.id;

    const fetchCollections = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/transactions/collections?filter=${filter}&loaner_id=${loaner_id}`,
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

    const formatMoney = (amount) => {
        return `₱${Number(amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (date) => {
        if (!date) return '-';

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleView = (collection) => {
        setSelectedCollection(collection);
    };

    const closeModal = () => {
        setSelectedCollection(null);
    };

    return (
        <div className="transaction-page">

            {/* HEADER */}
            <div className="transaction-header">
                <div>
                    <h1>Collections</h1>
                    <p>
                        Track and manage payment collections from borrowers.
                    </p>
                </div>

                <div className="transaction-count">
                    {collections.length} Collections
                </div>
            </div>

            {/* TOOLBAR */}
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
                    <option value="full">full payment</option>
                    <option value="partial">Partial</option>
                </select>

            </div>

            {/* TABLE */}
            <div className="transaction-table-wrapper">

                {loading ? (
                    <div className="transaction-empty">
                        <div className="transaction-spinner"></div>
                        <p>Loading collections...</p>
                    </div>

                ) : filteredCollections.length === 0 ? (
                    <div className="transaction-empty">
                        <h3>No Collections Found</h3>
                        <p>
                            There are no collections matching your criteria.
                        </p>
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

                                    {/* MEMBER */}
                                    <td>
                                        <div className="transaction-member">

                                            <div className="transaction-avatar">
                                                {item.firstname?.charAt(0)}
                                                {item.lastname?.charAt(0)}
                                            </div>

                                            <div>
                                                <strong>
                                                    {item.firstname}{' '}
                                                    {item.lastname}
                                                </strong>

                                                <span>
                                                    {item.member_id}
                                                </span>
                                            </div>

                                        </div>
                                    </td>

                                    {/* LOAN ID */}
                                    <td>
                                        {item.loan_id || '-'}
                                    </td>

                                    {/* AMOUNT DUE */}
                                    <td className="transaction-money">
                                        {formatMoney(item.amount_due)}
                                    </td>

                                    {/* AMOUNT RECEIVED */}
                                    <td className="transaction-success">
                                        {formatMoney(item.amount_received)}
                                    </td>

                                    {/* DATE */}
                                    <td>
                                        {formatDate(item.collection_date)}
                                    </td>

                                    {/* STATUS */}
                                    <td>
                                        <span
                                            className={`transaction-status ${
                                                item.status || 'pending'
                                            }`}
                                        >
                                            {item.status || 'Pending'}
                                        </span>
                                    </td>

                                    {/* ACTION */}
                                    <td>
                                        <button
                                            className="transaction-action-btn"
                                            onClick={() =>
                                                handleView(item)
                                            }
                                        >
                                            View
                                        </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>
                )}

            </div>

            {/* VIEW MODAL */}
            {selectedCollection && (
                <div
                    className="collection-modal-overlay"
                    onClick={closeModal}
                >
                    <div
                        className="collection-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* MODAL HEADER */}
                        <div className="collection-modal-header">

                            <div>
                                <span className="collection-modal-label">
                                    PAYMENT DETAILS
                                </span>

                                <h2>
                                    Collection #{selectedCollection.id}
                                </h2>
                            </div>

                            <button
                                className="collection-modal-close"
                                onClick={closeModal}
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>

                        {/* MEMBER CARD */}
                        <div className="collection-member-card">

                            <div className="collection-large-avatar">
                                {selectedCollection.firstname?.charAt(0)}
                                {selectedCollection.lastname?.charAt(0)}
                            </div>

                            <div className="collection-member-info">

                                <h3>
                                    {selectedCollection.firstname}{' '}
                                    {selectedCollection.lastname}
                                </h3>

                                <span>
                                    Member ID: {selectedCollection.member_id}
                                </span>

                            </div>

                            <span
                                className={`transaction-status ${
                                    selectedCollection.status || 'pending'
                                }`}
                            >
                                {selectedCollection.status || 'Pending'}
                            </span>

                        </div>

                        {/* PAYMENT AMOUNT */}
                        <div className="collection-payment-highlight">

                            <span>Amount Received</span>

                            <strong>
                                {formatMoney(
                                    selectedCollection.amount_received
                                )}
                            </strong>

                        </div>

                        {/* DETAILS */}
                        <div className="collection-details-grid">

                            <div className="collection-detail-item">
                                <span>Collection ID</span>
                                <strong>
                                    #{selectedCollection.id}
                                </strong>
                            </div>

                            <div className="collection-detail-item">
                                <span>Loan ID</span>
                                <strong>
                                    #{selectedCollection.loan_id || '-'}
                                </strong>
                            </div>

                            <div className="collection-detail-item">
                                <span>Amount Due</span>
                                <strong>
                                    {formatMoney(
                                        selectedCollection.amount_due
                                    )}
                                </strong>
                            </div>

                            <div className="collection-detail-item">
                                <span>Amount Received</span>
                                <strong className="collection-detail-success">
                                    {formatMoney(
                                        selectedCollection.amount_received
                                    )}
                                </strong>
                            </div>

                            <div className="collection-detail-item">
                                <span>Collection Date</span>
                                <strong>
                                    {formatDate(
                                        selectedCollection.collection_date
                                    )}
                                </strong>
                            </div>

                            <div className="collection-detail-item">
                                <span>Status</span>
                                <strong className="collection-detail-status">
                                    {selectedCollection.status || 'Pending'}
                                </strong>
                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="collection-modal-footer">

                            <button
                                className="collection-modal-done"
                                onClick={closeModal}
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Collections;