import React, { useEffect, useState } from 'react';
import '../styles/loan.css';
import { API_BASE_URL } from '../../../config';
const Active = () => {
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

            const response = await fetch(`${API_BASE_URL}/loans?status=active`, {
                headers: {
                    Authorization: `Bearer ${loanerToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch active loans');
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
                    <h1>Active Loans</h1>
                    <p>Monitor currently active loans and payments.</p>
                </div>

                <div className="loan-count">
                    {loans.length} Active
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
                        Loading active loans...
                    </div>
                ) : filteredLoans.length === 0 ? (
                    <div className="loan-empty">
                        <h3>No Active Loans</h3>
                        <p>There are currently no active loans.</p>
                    </div>
                ) : (
                    <table className="loan-table">

                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Loan Type</th>
                                <th>Principal</th>
                                <th>Total Due</th>
                                <th>Paid</th>
                                <th>Remaining</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredLoans.map((loan) => {

                                const totalDue = Number(loan.totalDue || 0);
                                const paid = Number(loan.total_paid || 0);
                                const remaining =
                                    loan.remaining_balance !== undefined
                                        ? Number(loan.remaining_balance)
                                        : totalDue - paid;

                                return (
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
                                            ₱{totalDue.toLocaleString()}
                                        </td>

                                        <td className="paid">
                                            ₱{paid.toLocaleString()}
                                        </td>

                                        <td className="remaining">
                                            ₱{remaining.toLocaleString()}
                                        </td>

                                        <td>
                                            {loan.due_date || '-'}
                                        </td>

                                        <td>
                                            <span className="loan-status active">
                                                Active
                                            </span>
                                        </td>

                                        <td>
                                            <button className="loan-action">
                                                View
                                            </button>
                                        </td>

                                    </tr>
                                );
                            })}

                        </tbody>

                    </table>
                )}

            </div>
        </div>
    );
};

export default Active;