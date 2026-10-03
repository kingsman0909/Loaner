import React, { useEffect, useState } from 'react';
import '../styles/loan.css';
import { API_BASE_URL } from '../../../config';
const Overdue = () => {
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

            const response = await fetch(`${API_BASE_URL}/loans?status=overdue`, {
                headers: {
                    Authorization: `Bearer ${loanerToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch overdue loans');
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
        <div className="loans-page overdue-page">

            <div className="loans-header">
                <div>
                    <h1>Overdue Loans</h1>
                    <p>Monitor loans that have passed their due date.</p>
                </div>

                <div className="loan-count danger-count">
                    {loans.length} Overdue
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
                        Loading overdue loans...
                    </div>
                ) : filteredLoans.length === 0 ? (
                    <div className="loan-empty">
                        <h3>No Overdue Loans</h3>
                        <p>Everyone is currently up to date.</p>
                    </div>
                ) : (
                    <table className="loan-table">

                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Loan Type</th>
                                <th>Remaining</th>
                                <th>Due Date</th>
                                <th>Days Overdue</th>
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

                                    <td className="remaining">
                                        ₱{Number(
                                            loan.remaining_balance || 0
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {loan.due_date || '-'}
                                    </td>

                                    <td>
                                        <strong className="overdue-days">
                                            {loan.days_overdue || 0} days
                                        </strong>
                                    </td>

                                    <td>
                                        <span className="loan-status overdue">
                                            Overdue
                                        </span>
                                    </td>

                                    <td>
                                        <button className="loan-action danger-action">
                                            Collect
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

export default Overdue;