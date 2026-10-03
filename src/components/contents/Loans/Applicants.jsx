import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';

import '../styles/loan.css';
import { API_BASE_URL } from '../../../config';
import Modal from '../modal/loanModal';

const LIMIT = 20;

const Applicants = () => {

    // =====================================================
    // STATE
    // =====================================================

    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);

    const [showModal, setShowModal] = useState({
        state: false,
        data: null
    });

    // =====================================================
    // REFS
    // =====================================================

    const observerRef = useRef(null);
    const loadingRef = useRef(false);
    const searchTimerRef = useRef(null);

    const loanerToken = localStorage.getItem('loaner_token');

    // =====================================================
    // FETCH APPLICATIONS
    // =====================================================

    const fetchApplications = useCallback(
        async ({
            reset = false,
            requestOffset = 0
        } = {}) => {

            // Prevent duplicate requests
            if (loadingRef.current) {
                return;
            }

            // Don't load if there is nothing more
            if (!reset && !hasMore) {
                return;
            }

            loadingRef.current = true;

            if (reset) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            try {

                const params = new URLSearchParams();

                params.set('limit', String(LIMIT));
                params.set('offset', String(requestOffset));

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

                const url =
                    `${API_BASE_URL}/loans/applications?${params.toString()}`;

                console.log(
                    'Fetching applications:',
                    url
                );

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${loanerToken}`
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();

                    throw new Error(
                        `HTTP ${response.status}: ${errorText}`
                    );
                }

                const result = await response.json();

                console.log(
                    'Applications response:',
                    result
                );

                // =================================================
                // YOUR ACTUAL RESPONSE:
                //
                // {
                //    data: [...],
                //    pagination: {...}
                // }
                // =================================================

                const newApplications =
                    Array.isArray(result.data)
                        ? result.data
                        : [];

                const pagination =
                    result.pagination || {};

                console.log(
                    'Received:',
                    newApplications.length,
                    'applications'
                );

                console.log(
                    'Pagination:',
                    pagination
                );

                // =================================================
                // RESET
                // =================================================

                if (reset) {

                    setApplications(
                        newApplications
                    );

                }

                // =================================================
                // LOAD MORE
                // =================================================

                else {

                    setApplications(prev => {

                        const existingIds =
                            new Set(
                                prev.map(
                                    item => item.id
                                )
                            );

                        const uniqueApplications =
                            newApplications.filter(
                                item =>
                                    !existingIds.has(
                                        item.id
                                    )
                            );

                        return [
                            ...prev,
                            ...uniqueApplications
                        ];
                    });
                }

                // =================================================
                // PAGINATION
                // =================================================

                const newTotal =
                    Number(
                        pagination.total || 0
                    );

                const newNextOffset =
                    Number(
                        pagination.nextOffset ??
                        (
                            requestOffset +
                            newApplications.length
                        )
                    );

                const newHasMore =
                    Boolean(
                        pagination.hasMore
                    );

                setTotal(newTotal);

                setOffset(newNextOffset);

                setHasMore(newHasMore);

                console.log(
                    `Loaded ${newApplications.length} records`
                );

                console.log(
                    `Next offset: ${newNextOffset}`
                );

                console.log(
                    `Has more: ${newHasMore}`
                );

            } catch (error) {

                console.error(
                    'Fetch applications error:',
                    error
                );

            } finally {

                loadingRef.current = false;

                setLoading(false);
                setLoadingMore(false);
            }
        },
        [
            search,
            status,
            hasMore,
            loanerToken
        ]
    );

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchApplications({
            reset: true,
            requestOffset: 0
        });

        // Only run once
        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);

    // =====================================================
    // SEARCH + STATUS CHANGE
    // =====================================================

    useEffect(() => {

        clearTimeout(
            searchTimerRef.current
        );

        searchTimerRef.current =
            setTimeout(() => {

                // Reset pagination
                setApplications([]);

                setOffset(0);

                setHasMore(true);

                // New request
                fetchApplications({
                    reset: true,
                    requestOffset: 0
                });

            }, 400);

        return () => {

            clearTimeout(
                searchTimerRef.current
            );

        };

    }, [search, status]);

    // =====================================================
    // LOAD MORE
    // =====================================================

    const loadMore = useCallback(() => {

        if (loadingRef.current) {
            return;
        }

        if (!hasMore) {
            return;
        }

        console.log(
            'Loading more...',
            'offset:',
            offset
        );

        fetchApplications({
            reset: false,
            requestOffset: offset
        });

    }, [
        offset,
        hasMore,
        fetchApplications
    ]);

    // =====================================================
    // INFINITE SCROLL
    // =====================================================

    useEffect(() => {

        const target =
            observerRef.current;

        if (!target) {
            return;
        }

        const observer =
            new IntersectionObserver(
                entries => {

                    const entry =
                        entries[0];

                    if (
                        entry.isIntersecting &&
                        hasMore &&
                        !loadingRef.current
                    ) {

                        loadMore();
                    }
                },
                {
                    root: null,

                    // Start loading before reaching bottom
                    rootMargin: '300px',

                    threshold: 0
                }
            );

        observer.observe(target);

        return () => {

            observer.disconnect();

        };

    }, [
        loadMore,
        hasMore
    ]);

    // =====================================================
    // MODAL
    // =====================================================

    const openModal = loan => {

        setShowModal({
            state: true,
            data: loan
        });

    };

    const closeModal = () => {

        setShowModal({
            state: false,
            data: null
        });

    };

    // =====================================================
    // FORMAT MONEY
    // =====================================================

    const formatMoney = amount => {

        return Number(
            amount || 0
        ).toLocaleString(
            'en-PH',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = date => {

        if (!date) {
            return '-';
        }

        const dateOnly =
            String(date).split('T')[0];

        const parsed =
            new Date(
                `${dateOnly}T00:00:00`
            );

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return date;
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

    // =====================================================
    // STATUS LABEL
    // =====================================================

    const getStatusLabel = value => {

        const labels = {
            active: 'Active',
            pending: 'Pending',
            paid: 'Paid',
            closed: 'Closed',
            overdue: 'Overdue'
        };

        return (
            labels[value] ||
            value ||
            'Unknown'
        );
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="loans-page">

            {/* =================================================
                MODAL
            ================================================= */}

            {showModal.state &&
                showModal.data && (

                    <Modal
                        loan={showModal.data}
                        setShowModal={closeModal}
                    />

                )
            }

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="loans-header">

                <div>

                    <h1>
                        Loan Applications
                    </h1>

                    <p>
                        Review and manage loan applications.
                    </p>

                </div>

                <div className="loan-count">

                    {total.toLocaleString()}
                    {' '}
                    Applications

                </div>

            </div>

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="loan-toolbar">

                {/* SEARCH */}

                <div className="loan-search">

                    <input
                        type="text"
                        placeholder="Search member..."
                        value={search}
                        onChange={e =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    {search && (

                        <button
                            type="button"
                            onClick={() =>
                                setSearch('')
                            }
                        >
                            ×
                        </button>

                    )}

                </div>

                {/* STATUS */}

                <select
                    value={status}
                    onChange={e =>
                        setStatus(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        All Status
                    </option>

                    <option value="active">
                        Active
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="paid">
                        Paid
                    </option>

                    <option value="closed">
                        Closed
                    </option>

                    <option value="overdue">
                        Overdue
                    </option>

                </select>

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="loan-table-wrapper">

                {/* INITIAL LOADING */}

                {loading ? (

                    <div className="loan-empty">

                        <span>
                            Loading applications...
                        </span>

                    </div>

                ) : applications.length === 0 ? (

                    /* EMPTY */

                    <div className="loan-empty">

                        <h3>
                            No Applications
                        </h3>

                        <p>

                            {search
                                ? `No applications found for "${search}".`
                                : status
                                    ? `No ${getStatusLabel(status).toLowerCase()} applications found.`
                                    : 'There are no loan applications.'
                            }

                        </p>

                    </div>

                ) : (

                    /* TABLE */

                    <table className="loan-table">

                        <thead>

                            <tr>

                                <th>
                                    Member
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
                                    Date
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {applications.map(
                                loan => (

                                    <tr
                                        key={loan.id}
                                    >

                                        {/* MEMBER */}

                                        <td>

                                            <div className="member-name">

                                                {
                                                    loan.member_name ||
                                                    `${loan.firstname || ''} ${loan.lastname || ''}`.trim() ||
                                                    'Unknown Member'
                                                }

                                            </div>

                                        </td>

                                        {/* LOAN TYPE */}

                                        <td>

                                            {
                                                loan.loan_type ||
                                                loan.type ||
                                                'Loan'
                                            }

                                        </td>

                                        {/* PRINCIPAL */}

                                        <td>

                                            ₱
                                            {formatMoney(
                                                loan.principalAmount
                                            )}

                                        </td>

                                        {/* INTEREST */}

                                        <td>

                                            {
                                                loan.interest_rate || 0
                                            }%

                                        </td>

                                        {/* TOTAL */}

                                        <td>

                                            ₱
                                            {formatMoney(
                                                loan.totalDue
                                            )}

                                        </td>

                                        {/* DATE */}

                                        <td>

                                            {formatDate(
                                                loan.releaseDate ||
                                                loan.created_at ||
                                                loan.createdAt
                                            )}

                                        </td>

                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    `loan-status ${
                                                        loan.status ||
                                                        'pending'
                                                    }`
                                                }
                                            >

                                                {
                                                    getStatusLabel(
                                                        loan.status
                                                    )
                                                }

                                            </span>

                                        </td>

                                        {/* ACTION */}

                                        <td>

                                            <button
                                                className="loan-action"
                                                onClick={() =>
                                                    openModal(
                                                        loan
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                )}

                {/* =================================================
                    INFINITE SCROLL TRIGGER
                ================================================= */}

                <div
                    ref={observerRef}
                    style={{
                        height: '20px'
                    }}
                />

                {/* =================================================
                    LOADING MORE
                ================================================= */}

                {loadingMore && (

                    <div className="loan-empty">

                        <span>
                            Loading more applications...
                        </span>

                    </div>

                )}

                {/* =================================================
                    END
                ================================================= */}

                {!loading &&
                    !loadingMore &&
                    !hasMore &&
                    applications.length > 0 && (

                        <div className="loan-empty">

                            <p>
                                You've reached the end of the applications.
                            </p>

                        </div>

                    )
                }

            </div>

        </div>
    );
};

export default Applicants;