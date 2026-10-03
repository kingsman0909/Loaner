import React, { useEffect, useState } from 'react';
import '../styles/loan.css';
import { API_BASE_URL } from '../../../config';
const Closed = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loanerToken = localStorage.getItem('loaner_token');

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/loans?status=closed`, {
                headers: {
                    Authorization: `Bearer ${loanerToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch closed loans');
            }

            const data = await response.json();

            setLoans(data.loans || data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLoans = loans.filter((loan) => {
        const name =
            `${loan.firstname || ''} ${loan.lastname || ''}`.toLowerCase();

        return name.includes(search.toLowerCase());
    });

    return (
        <div className="loans-page">

            <div className="loans-header">
                <div>
                    <h1>Closed Loans</h1>
                    <p>View completed and fully paid loans.</p>
                </div>

                <div className="loan-count">
                    {loans.length} Closed
                </div>
            </div>

            <div className="loan-toolbar">
                <input
                    type="text"
                    placeholder="Search member..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="loan-table-wrapper">

                {loading ? (
                    <div className="loan-empty">
                        Loading closed loans...
                    </div>
                ) : filteredLoans.length === 0 ? (
                    <div className="loan-empty">
                        <h3>No Closed Loans</h3>
                        <p>No completed loans found.</p>
                    </div>
                ) : (
                    <table className="loan-table">

                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Loan Type</th>
                                <th>Principal</th>
                                <th>Total Due</th>
                                <th>Total Paid</th>
                                <th>Release Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredLoans.map((loan) => (

                                <tr key={loan.id}>

                                    <td>
                                        <div className="member-name">
                                            {loan.firstname} {loan.lastname}
                                        </div>
                                    </td>

                                    <td>
                                        {loan.loan_type || loan.type || 'Loan'}
                                    </td>

                                    <td>
                                        ₱{Number(
                                            loan.principalAmount || 0
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        ₱{Number(
                                            loan.totalDue || 0
                                        ).toLocaleString()}
                                    </td>

                                    <td className="paid">
                                        ₱{Number(
                                            loan.total_paid || loan.totalDue || 0
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {loan.releaseDate || '-'}
                                    </td>

                                    <td>
                                        <span className="loan-status closed">
                                            Closed
                                        </span>
                                    </td>

                                    <td>
                                        <button className="loan-action">
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

export default Closed;