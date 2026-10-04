import React, { useEffect, useState } from 'react';
import '../styles/loan.css';
import { API_BASE_URL } from '../../../config';
const Active = () => {
    const [loans, setLoans] = useState([]);
    const [active, setActive] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [limit, setLimit] = useState(100);
    const [page, setPage] = useState(1);

    const loanerToken = localStorage.getItem('loaner_token');
    
    const fetchLoans = async () => {
        try {
            setLoading(true);
            console.log('getting active')
            const response = await fetch(`${API_BASE_URL}/loans?stat=active&page=1&limit=100`, {
                headers: {
                    Authorization: `Bearer ${loanerToken}`
                }
            });

            if (!response.ok) {
                alert(response.status);
                throw new Error('Failed fetch active loans');
            }

            const data = await response.json();
            console.log('active: ', data);
            setActive(data || []);
            
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchLoans();
    }, []);


    const filteredLoans = loans.filter((active) => {
        const name =
            `${active.firstname || ''} ${active.lastname || ''}`.toLowerCase();

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
                    {active.length} Active
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
                ) : active.length === 0 ? (
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

                            {filteredLoans.map((active) => {

                                const totalDue = Number(active.totalDue || 0);
                                const paid = Number(active.total_paid || 0);
                                const remaining =
                                    active.remaining_balance !== undefined
                                        ? Number(active.remaining_balance)
                                        : totalDue - paid;

                                
                                return (
                                    <tr key={active.id }>

                                        <td>
                                            <div className="member-name">
                                                {active.firstname} {active.lastname}
                                            </div>
                                        </td>

                                        <td>
                                            {active.loan_type || active.type || 'Loan'}
                                        </td>

                                        <td>
                                            ₱{Number(
                                                active.principalAmount || 0
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
                                            {active.due_date || '-'}
                                        </td>

                                        <td>
                                            <span className="loan-status active">
                                                {active.status}
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