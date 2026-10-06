import React, { useCallback, useEffect, useRef, useState } from 'react';
import '../styles/loan.css';
import { API_BASE_URL } from '../../../config';

const LIMIT = 20;

const STATUSES = ['pending', 'active', 'overdue', 'paid', 'closed'];

const getLoanId = loan => loan?.id ?? loan?.loan_id;

const getErrorMessage = (result, fallback) =>
    result?.message || result?.error || fallback;

const Loans = () => {
    const [loans, setLoans] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [loanType, setLoanType] = useState([]);
    const [loanTypeLoading, setLoanTypeLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const [modal, setModal] = useState({
        type: '',
        loan: null
    });

    const [form, setForm] = useState({
        member_id: '',
        loan_type_id: '',
        principalAmount: '',
        interest: '',
        totalDue: '',
        releaseDate: '',
        due_date: '',
        status: 'pending'
    });

    const [notice, setNotice] = useState({
        type: '',
        text: ''
    });

    const [formError, setFormError] = useState('');

    const requestRef = useRef(false);
    const requestIdRef = useRef(0);
    const observerRef = useRef(null);
    const debounceRef = useRef(null);

    const token = localStorage.getItem('loaner_token');

    /*
    |--------------------------------------------------------------------------
    | AUTH HEADERS
    |--------------------------------------------------------------------------
    */

    const authHeaders = useCallback((json = false) => {
        const headers = {
            Authorization: `Bearer ${localStorage.getItem('loaner_token') || ''}`
        };

        if (json) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    }, []);

    /*
    |--------------------------------------------------------------------------
    | API REQUEST
    |--------------------------------------------------------------------------
    */

    const apiRequest = useCallback(async (path, options = {}) => {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                ...authHeaders(Boolean(options.body)),
                ...options.headers
            }
        });

        const text = await response.text();

        let result = {};

        try {
            result = text ? JSON.parse(text) : {};
        } catch {
            result = {
                message: text
            };
        }

        if (!response.ok) {
            alert(result.message || result.status);
            throw new Error(
                getErrorMessage(
                    result,
                    `Request failed (${response.status})`
                )
            );
        }

        return result;
    }, [authHeaders]);

    /*
    |--------------------------------------------------------------------------
    | NOTICE
    |--------------------------------------------------------------------------
    */

    const showNotice = (type, text) => {
        setNotice({
            type,
            text
        });
    };

    /*
    |--------------------------------------------------------------------------
    | MODAL
    |--------------------------------------------------------------------------
    */

    const closeModal = () => {
        setModal({
            type: '',
            loan: null
        });

        setForm({
            member_id: '',
            loan_type_id: '',
            principalAmount: '',
            interest: '',
            totalDue: '',
            releaseDate: '',
            due_date: '',
            status: 'pending'
        });

        setFormError('');
    };

    /*
    |--------------------------------------------------------------------------
    | LOAN TYPE HELPERS
    |--------------------------------------------------------------------------
    */

    const getLoanTypeById = useCallback((id) => {
        if (!id) return null;

        return loanType.find(
            item => Number(item.id) === Number(id)
        ) || null;
    }, [loanType]);

    const getInterestByLoanType = useCallback((loanTypeId) => {
        const selectedType = getLoanTypeById(loanTypeId);

        if (!selectedType) {
            return '';
        }

        return Number(selectedType.interest || 0);
    }, [getLoanTypeById]);

    /*
    |--------------------------------------------------------------------------
    | CALCULATE TOTAL
    |--------------------------------------------------------------------------
    */

    const calculateTotalDue = useCallback((
        principalAmount,
        loanTypeId
    ) => {
        const principal = Number(principalAmount);

        if (!Number.isFinite(principal) || principal < 0) {
            return '';
        }

        const interest = getInterestByLoanType(loanTypeId);

        if (interest === '') {
            return '';
        }

        const rate = Number(interest);

        const total = principal + (
            principal * rate / 100
        );

        return total.toFixed(2);
    }, [getInterestByLoanType]);

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE LOAN
    |--------------------------------------------------------------------------
    */

    const normalizeLoan = loan => ({
        ...loan,

        id: getLoanId(loan),

        member_name:
            loan.member_name ||
            loan.full_name ||
            `${loan.firstname || ''} ${loan.lastname || ''}`.trim() ||
            'Unknown member',

        interest_rate:
            loan.interest_rate ??
            loan.interest ??
            0,

        total_paid:
            loan.total_paid ??
            0,

        remaining_balance:
            loan.remaining_balance ??
            Math.max(
                0,
                Number(loan.totalDue || 0) -
                Number(loan.total_paid || 0)
            )
    });

    /*
    |--------------------------------------------------------------------------
    | FETCH LOAN TYPES
    |--------------------------------------------------------------------------
    */

    const fetchLoanType = useCallback(async () => {
        setLoanTypeLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/loans/loantype`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const text = await response.text();

            let result = {};

            try {
                result = text ? JSON.parse(text) : {};
            } catch {
                result = {
                    message: text
                };
            }

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(
                        result,
                        'Unable to fetch loan types.'
                    )
                );
            }

            /*
             * Supports:
             *
             * [
             *   { id: 1, type: "Daily", interest: 5 }
             * ]
             *
             * or
             *
             * {
             *   data: [...]
             * }
             */

            const rows = Array.isArray(result)
                ? result
                : Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result.loanTypes)
                        ? result.loanTypes
                        : [];

            setLoanType(rows);

            console.log('Loan types:', rows);

        } catch (error) {
            console.error('Loan type error:', error);

            showNotice(
                'error',
                error.message || 'Unable to load loan types.'
            );

            setLoanType([]);

        } finally {
            setLoanTypeLoading(false);
        }
    }, [token]);

    /*
    |--------------------------------------------------------------------------
    | FETCH LOANS
    |--------------------------------------------------------------------------
    */

    const fetchLoans = useCallback(async ({
        reset = false,
        requestOffset = 0
    } = {}) => {

        if (requestRef.current) {
            return;
        }

        const requestId = ++requestIdRef.current;

        requestRef.current = true;

        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {

            const params = new URLSearchParams({
                limit: String(LIMIT),
                offset: String(requestOffset)
            });

            if (search.trim()) {
                params.set(
                    'search',
                    search.trim()
                );
            }

            if (status) {
                params.set(
                    'status',
                    status
                );
            }

            const result = await apiRequest(
                `/loans?${params}`,
                {
                    method: 'GET'
                }
            );

            if (requestId !== requestIdRef.current) {
                return;
            }

            const payload = result.data ?? result;

            const rows = Array.isArray(payload)
                ? payload
                : Array.isArray(payload.data)
                    ? payload.data
                    : Array.isArray(payload.loans)
                        ? payload.loans
                        : [];

            const pagination =
                result.pagination ||
                payload.pagination ||
                {};

            const normalized =
                rows.map(normalizeLoan);

            setLoans(previous => {

                if (reset) {
                    return normalized;
                }

                const existing = new Set(
                    previous.map(
                        item => String(item.id)
                    )
                );

                return [
                    ...previous,

                    ...normalized.filter(
                        item =>
                            !existing.has(
                                String(item.id)
                            )
                    )
                ];
            });

            const newOffset = Number(
                pagination.nextOffset ??
                (
                    requestOffset +
                    normalized.length
                )
            );

            setOffset(newOffset);

            setTotal(
                Number(
                    pagination.total ??
                    normalized.length
                )
            );

            setHasMore(
                pagination.hasMore ??
                (
                    normalized.length === LIMIT
                )
            );

        } catch (error) {

            if (requestId === requestIdRef.current) {

                showNotice(
                    'error',
                    error.message ||
                    'Unable to load loans.'
                );
            }

        } finally {

            if (requestId === requestIdRef.current) {

                requestRef.current = false;

                setLoading(false);

                setLoadingMore(false);
            }
        }

    }, [
        apiRequest,
        search,
        status
    ]);

    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        fetchLoanType();

    }, [fetchLoanType]);

    /*
    |--------------------------------------------------------------------------
    | SEARCH / FILTER DEBOUNCE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        clearTimeout(
            debounceRef.current
        );

        debounceRef.current =
            setTimeout(() => {

                requestIdRef.current++;

                requestRef.current = false;

                setLoans([]);

                setOffset(0);

                setHasMore(false);

                fetchLoans({
                    reset: true,
                    requestOffset: 0
                });

            }, 350);

        return () => {
            clearTimeout(
                debounceRef.current
            );
        };

    }, [
        search,
        status,
        fetchLoans
    ]);

    /*
    |--------------------------------------------------------------------------
    | LOAD MORE
    |--------------------------------------------------------------------------
    */

    const loadMore = useCallback(() => {

        if (
            requestRef.current ||
            loading ||
            loadingMore ||
            !hasMore
        ) {
            return;
        }

        fetchLoans({
            reset: false,
            requestOffset: offset
        });

    }, [
        fetchLoans,
        hasMore,
        loading,
        loadingMore,
        offset
    ]);

    /*
    |--------------------------------------------------------------------------
    | INFINITE SCROLL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const target =
            observerRef.current;

        if (!target) {
            return;
        }

        const observer =
            new IntersectionObserver(
                entries => {

                    if (
                        entries[0]?.isIntersecting
                    ) {
                        loadMore();
                    }

                },
                {
                    rootMargin: '250px',
                    threshold: 0
                }
            );

        observer.observe(target);

        return () =>
            observer.disconnect();

    }, [loadMore]);

    /*
    |--------------------------------------------------------------------------
    | REFRESH
    |--------------------------------------------------------------------------
    */

    const refreshLoans = async () => {

        requestIdRef.current++;

        requestRef.current = false;

        setLoans([]);

        setOffset(0);

        setHasMore(false);

        await fetchLoans({
            reset: true,
            requestOffset: 0
        });
    };

    /*
    |--------------------------------------------------------------------------
    | CREATE
    |--------------------------------------------------------------------------
    */

    const openCreate = () => {

        setForm({
            member_id: '',
            loan_type_id: '',
            principalAmount: '',
            interest: '',
            totalDue: '',
            releaseDate: '',
            due_date: '',
            status: 'pending'
        });

        setFormError('');

        setModal({
            type: 'create',
            loan: null
        });
    };

    /*
    |--------------------------------------------------------------------------
    | VIEW
    |--------------------------------------------------------------------------
    */

    const openView = loan => {

        setFormError('');

        setModal({
            type: 'view',
            loan
        });
    };

    /*
    |--------------------------------------------------------------------------
    | DATE
    |--------------------------------------------------------------------------
    */

    const dateInput = value => {

        if (!value) {
            return '';
        }

        return String(value)
            .split('T')[0]
            .slice(0, 10);
    };

    /*
    |--------------------------------------------------------------------------
    | EDIT
    |--------------------------------------------------------------------------
    */

    const openEdit = loan => {

        const selectedLoanType =
            getLoanTypeById(
                loan.loan_type_id
            );

        const selectedInterest =
            selectedLoanType
                ? Number(selectedLoanType.interest || 0)
                : Number(
                    loan.interest_rate ??
                    loan.interest ??
                    0
                );

        const principal =
            Number(
                loan.principalAmount || 0
            );

        const calculatedTotal =
            selectedLoanType
                ? calculateTotalDue(
                    principal,
                    loan.loan_type_id
                )
                : loan.totalDue ?? '';

        setForm({

            member_id:
                loan.member_id ?? '',

            loan_type_id:
                loan.loan_type_id ?? '',

            principalAmount:
                loan.principalAmount ?? '',

            interest:
                selectedInterest,

            totalDue:
                calculatedTotal,

            releaseDate:
                dateInput(
                    loan.releaseDate ||
                    loan.created_at
                ),

            due_date:
                dateInput(
                    loan.due_date
                ),

            status:
                loan.status ||
                'pending'
        });

        setFormError('');

        setModal({
            type: 'edit',
            loan
        });
    };

    /*
    |--------------------------------------------------------------------------
    | FORM UPDATE
    |--------------------------------------------------------------------------
    */

    const updateForm = event => {

        const {
            name,
            value
        } = event.target;

        setForm(previous => {

            const next = {
                ...previous,
                [name]: value
            };

            /*
             * LOAN TYPE CHANGED
             *
             * Get interest directly from:
             *
             * loan_type.id
             *
             * NOT:
             *
             * loanType[value - 1]
             */

            if (name === 'loan_type_id') {

                const selectedType =
                    getLoanTypeById(value);

                const selectedInterest =
                    selectedType
                        ? Number(
                            selectedType.interest || 0
                        )
                        : '';

                next.interest =
                    selectedInterest;

                next.totalDue =
                    calculateTotalDue(
                        next.principalAmount,
                        value
                    );
            }

            /*
             * PRINCIPAL CHANGED
             */

            if (name === 'principalAmount') {

                next.totalDue =
                    calculateTotalDue(
                        value,
                        next.loan_type_id
                    );
            }

            /*
             * NEVER allow manual interest
             * changes because interest comes
             * from loan_type.
             */

            if (name === 'interest') {

                const selectedInterest =
                    getInterestByLoanType(
                        next.loan_type_id
                    );

                next.interest =
                    selectedInterest;

                next.totalDue =
                    calculateTotalDue(
                        next.principalAmount,
                        next.loan_type_id
                    );
            }

            return next;
        });
    };

    /*
    |--------------------------------------------------------------------------
    | SAVE LOAN
    |--------------------------------------------------------------------------
    */

    const saveLoan = async event => {

        event.preventDefault();

        setFormError('');

        const principal =
            Number(
                form.principalAmount
            );

        const memberId =
            Number(
                form.member_id
            );

        const loanTypeId =
            Number(
                form.loan_type_id
            );

        /*
         * GET THE REAL LOAN TYPE
         */

        const selectedLoanType =
            getLoanTypeById(
                loanTypeId
            );

        if (
            !Number.isInteger(memberId) ||
            memberId <= 0
        ) {

            setFormError(
                'Enter a valid member ID.'
            );

            return;
        }

        if (
            !Number.isInteger(loanTypeId) ||
            loanTypeId <= 0
        ) {

            setFormError(
                'Please select a valid loan type.'
            );

            return;
        }

        if (!selectedLoanType) {

            setFormError(
                'Selected loan type does not exist.'
            );

            return;
        }

        if (
            !Number.isFinite(principal) ||
            principal <= 0
        ) {

            setFormError(
                'Principal must be greater than zero.'
            );

            return;
        }

        /*
         * INTEREST MUST COME FROM DATABASE
         */

        const interest =
            Number(
                selectedLoanType.interest || 0
            );

        const calculatedTotal =
            Number(
                (
                    principal +
                    (
                        principal *
                        interest /
                        100
                    )
                ).toFixed(2)
            );

        if (!form.due_date) {

            setFormError(
                'Please select a due date.'
            );

            return;
        }

        const payload = {

            member_id:
                memberId,

            loan_type_id:
                loanTypeId,

            principalAmount:
                principal,

            /*
             * Derived from loan_type.
             */
            interest:
                interest,

            /*
             * Derived from principal + loan type interest.
             */
            totalDue:
                calculatedTotal,

            releaseDate:
                form.releaseDate ||
                null,

            due_date:
                form.due_date,

            status:
                modal.type === 'edit'
                    ? form.status
                    : 'active'
        };

        console.log(
            'Saving loan:',
            payload
        );

        setSaving(true);

        try {

            const isEdit =
                modal.type === 'edit';

            const path =
                isEdit
                    ? `/loans/${encodeURIComponent(
                        getLoanId(modal.loan)
                    )}`
                    : '/loans';

            await apiRequest(
                path,
                {
                    method:
                        isEdit
                            ? 'PUT'
                            : 'POST',

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

            closeModal();

            showNotice(
                'success',
                isEdit
                    ? 'Loan updated successfully.'
                    : 'Loan created successfully.'
            );

            await refreshLoans();

        } catch (error) {

            setFormError(
                error.message ||
                'Unable to save the loan.'
            );

        } finally {

            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    const deleteLoan = async () => {

        const id =
            getLoanId(
                modal.loan
            );

        if (!id) {
            return;
        }

        setDeleting(true);

        try {

            await apiRequest(
                `/loans/${encodeURIComponent(id)}`,
                {
                    method: 'DELETE'
                }
            );

            closeModal();

            showNotice(
                'success',
                'Loan deleted successfully.'
            );

            await refreshLoans();

        } catch (error) {

            setFormError(
                error.message ||
                'Unable to delete the loan.'
            );

        } finally {

            setDeleting(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FORMATTERS
    |--------------------------------------------------------------------------
    */

    const money = value =>
        Number(
            value || 0
        ).toLocaleString(
            'en-PH',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    const formatDate = value => {

        if (!value) {
            return '—';
        }

        const parsed =
            new Date(
                `${dateInput(value)}T00:00:00`
            );

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return '—';
        }

        return parsed.toLocaleDateString(
            'en-PH',
            {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }
        );
    };

    const label = value =>
        value
            ? value
                .charAt(0)
                .toUpperCase() +
                value.slice(1)
            : 'Unknown';

    /*
    |--------------------------------------------------------------------------
    | SELECTED LOAN TYPE
    |--------------------------------------------------------------------------
    */

    const selectedLoanType =
        getLoanTypeById(
            form.loan_type_id
        );

    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <main className="loans-page">

            {/* HEADER */}

            <header className="loans-header">

                <div>

                    <span className="loans-eyebrow">
                        LOANER WORKSPACE
                    </span>

                    <h1>
                        Loan Management
                    </h1>

                    <p>
                        Manage loan records, balances,
                        and repayment status.
                    </p>

                </div>

                <div className="loans-header-actions">

                    <div className="loan-count">

                        <span>
                            Total records
                        </span>

                        <strong>
                            {total.toLocaleString()}
                        </strong>

                    </div>

                    <button
                        className="loan-btn loan-btn-primary"
                        onClick={openCreate}
                    >
                        <span>＋</span>
                        New Loan
                    </button>

                </div>

            </header>

            {/* NOTICE */}

            {notice.text && (

                <div
                    className={`loan-notice ${notice.type}`}
                    role="status"
                >

                    <span>
                        {notice.text}
                    </span>

                    <button
                        onClick={() =>
                            setNotice({
                                type: '',
                                text: ''
                            })
                        }
                    >
                        ×
                    </button>

                </div>

            )}

            {/* TOOLBAR */}

            <section className="loan-toolbar">

                <label className="loan-search">

                    <span aria-hidden="true">
                        ⌕
                    </span>

                    <input
                        type="search"
                        placeholder="Search member, contact, or loan ID..."
                        value={search}
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                    {search && (

                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() =>
                                setSearch('')
                            }
                        >
                            ×
                        </button>

                    )}

                </label>

                <select
                    className="loan-filter"
                    value={status}
                    onChange={event =>
                        setStatus(
                            event.target.value
                        )
                    }
                    aria-label="Filter loans by status"
                >

                    <option value="">
                        All statuses
                    </option>

                    {STATUSES.map(item => (

                        <option
                            key={item}
                            value={item}
                        >
                            {label(item)}
                        </option>

                    ))}

                </select>

                <button
                    className="loan-btn loan-btn-secondary"
                    onClick={refreshLoans}
                    disabled={loading}
                >
                    ↻ Refresh
                </button>

            </section>

            {/* TABLE */}

            <section className="loan-table-card">

                <div className="loan-table-heading">

                    <div>

                        <h2>
                            All Loans
                        </h2>

                        <p>
                            Review each loan and its
                            current balance.
                        </p>

                    </div>

                    <span className="loan-result-count">
                        {loans.length} loaded
                    </span>

                </div>

                <div className="loan-table-scroll">

                    {loading &&
                    loans.length === 0 ? (

                        <div className="loan-state">

                            <span className="loan-spinner" />

                            <p>
                                Loading loans...
                            </p>

                        </div>

                    ) : loans.length === 0 ? (

                        <div className="loan-state">

                            <div className="loan-state-icon">
                                ⌕
                            </div>

                            <h3>
                                No loans found
                            </h3>

                            <p>
                                {search || status
                                    ? 'Try changing your search or status filter.'
                                    : 'Create your first loan using the New Loan button.'
                                }
                            </p>

                            {!search &&
                            !status && (

                                <button
                                    className="loan-btn loan-btn-primary"
                                    onClick={openCreate}
                                >
                                    Create a loan
                                </button>

                            )}

                        </div>

                    ) : (

                        <table className="loan-table">

                            <thead>

                                <tr>

                                    <th>
                                        Loan / Member
                                    </th>

                                    <th>
                                        Loan Type
                                    </th>

                                    <th>
                                        Principal
                                    </th>

                                    <th>
                                        Interest
                                    </th>

                                    <th>
                                        Total Due
                                    </th>

                                    <th>
                                        Remaining
                                    </th>

                                    <th>
                                        Due Date
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {loans.map(loan => (

                                    <tr
                                        key={loan.id}
                                    >

                                        <td>

                                            <div className="loan-member-cell">

                                                <span className="loan-avatar">

                                                    {(loan.member_name || 'M')
                                                        .trim()
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </span>

                                                <div>

                                                    <strong>
                                                        {loan.member_name}
                                                    </strong>

                                                    <span>

                                                        Loan #{loan.id}

                                                        {loan.member_contact
                                                            ? ` · ${loan.member_contact}`
                                                            : ''
                                                        }

                                                    </span>

                                                </div>

                                            </div>

                                        </td>

                                        <td>
                                            {loan.loan_type || '—'}
                                        </td>

                                        <td>
                                            ₱{money(
                                                loan.principalAmount
                                            )}
                                        </td>

                                        <td>
                                            {Number(
                                                loan.interest_rate || 0
                                            )}%
                                        </td>

                                        <td className="loan-money">
                                            ₱{money(
                                                loan.totalDue
                                            )}
                                        </td>

                                        <td className="loan-balance">
                                            ₱{money(
                                                loan.remaining_balance
                                            )}
                                        </td>

                                        <td>
                                            {formatDate(
                                                loan.due_date
                                            )}
                                        </td>

                                        <td>

                                            <span
                                                className={`loan-status ${String(
                                                    loan.status ||
                                                    'pending'
                                                ).toLowerCase()}`}
                                            >
                                                {label(
                                                    loan.status
                                                )}
                                            </span>

                                        </td>

                                        <td>

                                            <div className="loan-row-actions">

                                                <button
                                                    className="loan-icon-btn"
                                                    title="View loan"
                                                    aria-label="View loan"
                                                    onClick={() =>
                                                        openView(
                                                            loan
                                                        )
                                                    }
                                                >
                                                    ↗
                                                </button>

                                                <button
                                                    className="loan-icon-btn"
                                                    title="Edit loan"
                                                    aria-label="Edit loan"
                                                    onClick={() =>
                                                        openEdit(
                                                            loan
                                                        )
                                                    }
                                                >
                                                    ✎
                                                </button>

                                                <button
                                                    className="loan-icon-btn danger"
                                                    title="Delete loan"
                                                    aria-label="Delete loan"
                                                    onClick={() => {

                                                        setFormError('');

                                                        setModal({
                                                            type: 'delete',
                                                            loan
                                                        });

                                                    }}
                                                >
                                                    ⌫
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

                {loadingMore && (

                    <div className="loan-load-more">
                        Loading more loans…
                    </div>

                )}

                <div
                    className="loan-scroll-trigger"
                    ref={observerRef}
                />

                {!loading &&
                loans.length > 0 &&
                hasMore && (

                    <div className="loan-load-more">

                        <button
                            className="loan-btn loan-btn-secondary"
                            disabled={loadingMore}
                            onClick={loadMore}
                        >
                            {loadingMore
                                ? 'Loading…'
                                : 'Load more'
                            }
                        </button>

                    </div>

                )}

                {!loading &&
                loans.length > 0 &&
                !hasMore && (

                    <div className="loan-end-message">

                        End of results ·{' '}
                        {loans.length}{' '}
                        loan(s) loaded

                    </div>

                )}

            </section>

            {/* =========================================================
                CREATE / EDIT MODAL
            ========================================================= */}

            {(modal.type === 'create' ||
            modal.type === 'edit') && (

                <div
                    className="loan-modal-backdrop"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget &&
                            !saving
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <section
                        className="loan-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="loan-form-title"
                    >

                        <header className="loan-modal-header">

                            <div>

                                <span className="loans-eyebrow">

                                    {modal.type === 'edit'
                                        ? 'UPDATE RECORD'
                                        : 'NEW RECORD'
                                    }

                                </span>

                                <h2 id="loan-form-title">

                                    {modal.type === 'edit'
                                        ? 'Edit Loan'
                                        : 'Create Loan'
                                    }

                                </h2>

                                <p>
                                    Enter the loan information below.
                                </p>

                            </div>

                            <button
                                className="loan-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close modal"
                            >
                                ×
                            </button>

                        </header>

                        <form
                            onSubmit={saveLoan}
                        >

                            <div className="loan-modal-body">

                                {formError && (

                                    <div className="loan-form-error">
                                        {formError}
                                    </div>

                                )}

                                <div className="loan-form-grid">

                                    {/* MEMBER */}

                                    <label className="loan-field">

                                        <span>
                                            Member ID *
                                        </span>

                                        <input
                                            name="member_id"
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={form.member_id}
                                            onChange={updateForm}
                                            required
                                        />

                                    </label>

                                    {/* LOAN TYPE */}

                                    <label className="loan-field">

                                        <span>
                                            Loan Type *
                                        </span>

                                        <select
                                            name="loan_type_id"
                                            value={form.loan_type_id}
                                            onChange={updateForm}
                                            required
                                            disabled={
                                                loanTypeLoading ||
                                                saving
                                            }
                                        >

                                            <option value="">
                                                {loanTypeLoading
                                                    ? 'Loading loan types...'
                                                    : 'Select loan type'
                                                }
                                            </option>

                                            {loanType.map(type => (

                                                <option
                                                    key={type.id}
                                                    value={type.id}
                                                >

                                                    {type.type}
                                                    {' — '}
                                                    {Number(
                                                        type.interest || 0
                                                    )}%

                                                </option>

                                            ))}

                                        </select>

                                        {selectedLoanType && (

                                            <small>

                                                Interest:
                                                {' '}
                                                <strong>
                                                    {Number(
                                                        selectedLoanType.interest || 0
                                                    )}%
                                                </strong>

                                            </small>

                                        )}

                                    </label>

                                    {/* PRINCIPAL */}

                                    <label className="loan-field">

                                        <span>
                                            Principal Amount (₱) *
                                        </span>

                                        <input
                                            name="principalAmount"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={
                                                form.principalAmount
                                            }
                                            onChange={
                                                updateForm
                                            }
                                            required
                                        />

                                    </label>

                                    {/* INTEREST */}

                                    <label className="loan-field">

                                        <span>
                                            Interest (%)
                                        </span>

                                        <input
                                            name="interest"
                                            type="number"
                                            value={
                                                form.interest
                                            }
                                            readOnly
                                            tabIndex="-1"
                                        />

                                        <small>
                                            Automatically determined by loan type.
                                        </small>

                                    </label>

                                    {/* TOTAL */}

                                    <label className="loan-field">

                                        <span>
                                            Total Due (₱)
                                        </span>

                                        <input
                                            type="number"
                                            value={
                                                form.totalDue
                                            }
                                            readOnly
                                            tabIndex="-1"
                                        />

                                        <small>
                                            Principal + loan type interest.
                                        </small>

                                    </label>

                                    {/* STATUS */}

                                    {modal.type === 'edit' &&
                                    <label className="loan-field">

                                        <span>
                                            Status *
                                        </span>

                                        <select
                                            name="status"
                                            value={
                                                form.status
                                            }
                                            onChange={
                                                updateForm
                                            }
                                            required
                                        >

                                            {STATUSES.map(item => (

                                                <option
                                                    key={item}
                                                    value={item}
                                                >
                                                    {label(item)}
                                                </option>

                                            ))}

                                        </select>

                                    </label>

                                    

                                    }
                                    {/* RELEASE DATE */}

                                    <label className="loan-field">

                                        <span>
                                            Release Date
                                        </span>

                                        <input
                                            name="releaseDate"
                                            type="date"
                                            value={
                                                form.releaseDate
                                            }
                                            onChange={
                                                updateForm
                                            }
                                        />

                                    </label>

                                    {/* DUE DATE */}

                                    <label className="loan-field">

                                        <span>
                                            Due Date *
                                        </span>

                                        <input
                                            name="due_date"
                                            type="date"
                                            value={
                                                form.due_date
                                            }
                                            onChange={
                                                updateForm
                                            }
                                            required
                                        />

                                    </label>

                                </div>

                                {/* SELECTED TYPE SUMMARY */}

                                {selectedLoanType && (

                                    <div className="loan-form-hint">

                                        <strong>
                                            {selectedLoanType.type}
                                        </strong>

                                        {' '}loan selected.

                                        Interest rate is{' '}

                                        <strong>
                                            {Number(
                                                selectedLoanType.interest || 0
                                            )}%
                                        </strong>

                                        .

                                        {form.principalAmount && (

                                            <>
                                                {' '}
                                                For ₱
                                                {money(
                                                    form.principalAmount
                                                )},
                                                total due is{' '}

                                                <strong>
                                                    ₱
                                                    {money(
                                                        form.totalDue
                                                    )}
                                                </strong>.
                                            </>

                                        )}

                                    </div>

                                )}

                            </div>

                            <footer className="loan-modal-footer">

                                <button
                                    type="button"
                                    className="loan-btn loan-btn-secondary"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="loan-btn loan-btn-primary"
                                    disabled={
                                        saving ||
                                        loanTypeLoading ||
                                        loanType.length === 0
                                    }
                                >

                                    {saving
                                        ? 'Saving…'
                                        : modal.type === 'edit'
                                            ? 'Save Changes'
                                            : 'Create Loan'
                                    }

                                </button>

                            </footer>

                        </form>

                    </section>

                </div>

            )}

            {/* =========================================================
                VIEW MODAL
            ========================================================= */}

            {modal.type === 'view' &&
            modal.loan && (

                <div
                    className="loan-modal-backdrop"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <section
                        className="loan-modal loan-detail-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="loan-detail-title"
                    >

                        <header className="loan-modal-header">

                            <div>

                                <span className="loans-eyebrow">

                                    LOAN #
                                    {getLoanId(
                                        modal.loan
                                    )}

                                </span>

                                <h2 id="loan-detail-title">
                                    Loan Details
                                </h2>

                                <p>
                                    {modal.loan.member_name}
                                </p>

                            </div>

                            <button
                                className="loan-modal-close"
                                onClick={closeModal}
                                aria-label="Close modal"
                            >
                                ×
                            </button>

                        </header>

                        <div className="loan-modal-body">

                            <div className="loan-detail-hero">

                                <span>
                                    Remaining Balance
                                </span>

                                <strong>
                                    ₱
                                    {money(
                                        modal.loan.remaining_balance
                                    )}
                                </strong>

                                <span
                                    className={`loan-status ${String(
                                        modal.loan.status ||
                                        'pending'
                                    ).toLowerCase()}`}
                                >
                                    {label(
                                        modal.loan.status
                                    )}
                                </span>

                            </div>

                            <div className="loan-detail-grid">

                                <div>
                                    <span>
                                        Member
                                    </span>

                                    <strong>
                                        {modal.loan.member_name}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Member ID
                                    </span>

                                    <strong>
                                        {modal.loan.member_id ?? '—'}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Contact
                                    </span>

                                    <strong>
                                        {modal.loan.member_contact || '—'}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Loan Type
                                    </span>

                                    <strong>
                                        {modal.loan.loan_type || '—'}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Loan Type ID
                                    </span>

                                    <strong>
                                        {modal.loan.loan_type_id ?? '—'}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Principal
                                    </span>

                                    <strong>
                                        ₱
                                        {money(
                                            modal.loan.principalAmount
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Interest Rate
                                    </span>

                                    <strong>
                                        {Number(
                                            modal.loan.interest_rate || 0
                                        )}%
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Total Due
                                    </span>

                                    <strong>
                                        ₱
                                        {money(
                                            modal.loan.totalDue
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Total Paid
                                    </span>

                                    <strong>
                                        ₱
                                        {money(
                                            modal.loan.total_paid
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Release Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            modal.loan.releaseDate ||
                                            modal.loan.created_at
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Due Date
                                    </span>

                                    <strong>
                                        {formatDate(
                                            modal.loan.due_date
                                        )}
                                    </strong>
                                </div>

                            </div>

                        </div>

                        <footer className="loan-modal-footer">

                            <button
                                className="loan-btn loan-btn-secondary"
                                onClick={closeModal}
                            >
                                Close
                            </button>

                            <button
                                className="loan-btn loan-btn-primary"
                                onClick={() =>
                                    openEdit(
                                        modal.loan
                                    )
                                }
                            >
                                Edit Loan
                            </button>

                        </footer>

                    </section>

                </div>

            )}

            {/* =========================================================
                DELETE MODAL
            ========================================================= */}

            {modal.type === 'delete' &&
            modal.loan && (

                <div
                    className="loan-modal-backdrop"
                    onMouseDown={event => {

                        if (
                            event.target ===
                            event.currentTarget &&
                            !deleting
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <section
                        className="loan-modal loan-confirm-modal"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="loan-delete-title"
                    >

                        <div className="loan-delete-icon">
                            !
                        </div>

                        <h2 id="loan-delete-title">
                            Delete this loan?
                        </h2>

                        <p>

                            Loan #
                            {getLoanId(
                                modal.loan
                            )}

                            {' '}for{' '}

                            <strong>
                                {modal.loan.member_name}
                            </strong>

                            {' '}will be deleted.

                            This action may be blocked
                            if payment records depend
                            on it.

                        </p>

                        {formError && (

                            <div className="loan-form-error">
                                {formError}
                            </div>

                        )}

                        <footer className="loan-modal-footer">

                            <button
                                className="loan-btn loan-btn-secondary"
                                onClick={closeModal}
                                disabled={deleting}
                            >
                                Cancel
                            </button>

                            <button
                                className="loan-btn loan-btn-danger"
                                onClick={deleteLoan}
                                disabled={deleting}
                            >
                                {deleting
                                    ? 'Deleting…'
                                    : 'Delete Loan'
                                }
                            </button>

                        </footer>

                    </section>

                </div>

            )}

        </main>
    );
};

export default Loans;