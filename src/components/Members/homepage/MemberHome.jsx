import React, { useEffect, useState } from "react";
import { API_BASE_URL } from '../../../config';
const MemberHome = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const memberData = localStorage.getItem('member_token');

    const [selectedLoan, setSelectedLoan] = useState(null);

    // =========================================================
    // FETCH MEMBER DATA
    // =========================================================

    useEffect(() => {
      const fetchMemberData = async () => {
          try {
              setLoading(true);
              setError("");

              const response = await fetch(`${API_BASE_URL}/member/me?i${memberData.id}`, {
                  method: "GET",
                  headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                  },
              });

              const result = await response.json();

              if (!response.ok || !result.success) {
                  throw new Error(
                      result.message || "Failed to load member data"
                  );
              }

              setData(result.data);

          } catch (err) {
              console.error("MEMBER DATA ERROR:", err);
              setError(err.message || "Something went wrong");
          } finally {
              setLoading(false);
          }
      };

      fetchMemberData();
  }, []);


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                    <p className="text-gray-600">
                        Loading your account...
                    </p>
                </div>
            </div>
        );
    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">

                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        !
                    </div>

                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Unable to load your account
                    </h2>

                    <p className="text-gray-500 mb-6">
                        {error}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                        Try Again
                    </button>

                </div>
            </div>
        );
    }


    if (!data) {
        return null;
    }


    const {
        member,
        loaner,
        balance,
        statistics,
        loans = [],
    } = data;


    // =========================================================
    // HELPERS
    // =========================================================

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(Number(value || 0));
    };


    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };


    const getStatusClass = (status) => {
        switch (status) {
            case "active":
                return "bg-blue-100 text-blue-700";

            case "overdue":
                return "bg-red-100 text-red-700";

            case "paid":
                return "bg-green-100 text-green-700";

            case "closed":
                return "bg-gray-100 text-gray-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };


    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-5">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div>
                            <p className="text-sm text-gray-500">
                                Welcome back
                            </p>

                            <h1 className="text-2xl font-bold text-gray-900">
                                {member.full_name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">

                            <span
                                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${member.status === "approved"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {member.status}
                            </span>

                        </div>

                    </div>

                </div>
            </header>


            {/* ================================================= */}
            {/* MAIN */}
            {/* ================================================= */}

            <main className="max-w-7xl mx-auto px-6 py-8">


                {/* ================================================= */}
                {/* BALANCE CARDS */}
                {/* ================================================= */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                    {/* Remaining Balance */}

                    <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-sm">

                        <p className="text-blue-100 text-sm">
                            Remaining Balance
                        </p>

                        <h2 className="text-3xl font-bold mt-2">
                            {formatCurrency(balance.remaining_balance)}
                        </h2>

                        <p className="text-blue-100 text-sm mt-3">
                            Current outstanding balance
                        </p>

                    </div>


                    {/* Total Paid */}

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

                        <p className="text-gray-500 text-sm">
                            Total Paid
                        </p>

                        <h2 className="text-2xl font-bold text-green-600 mt-2">
                            {formatCurrency(balance.total_paid)}
                        </h2>

                        <p className="text-gray-400 text-sm mt-3">
                            Payments made
                        </p>

                    </div>


                    {/* Total Borrowed */}

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

                        <p className="text-gray-500 text-sm">
                            Total Borrowed
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                            {formatCurrency(statistics.total_borrowed)}
                        </h2>

                        <p className="text-gray-400 text-sm mt-3">
                            Across all loans
                        </p>

                    </div>


                    {/* Total Loans */}

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">

                        <p className="text-gray-500 text-sm">
                            Total Loans
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-2">
                            {statistics.total_loans}
                        </h2>

                        <p className="text-gray-400 text-sm mt-3">
                            Loan accounts
                        </p>

                    </div>

                </div>


                {/* ================================================= */}
                {/* LOAN STATISTICS */}
                {/* ================================================= */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">
                            Active
                        </p>

                        <p className="text-2xl font-bold text-blue-600 mt-1">
                            {statistics.active_loans}
                        </p>
                    </div>


                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">
                            Overdue
                        </p>

                        <p className="text-2xl font-bold text-red-600 mt-1">
                            {statistics.overdue_loans}
                        </p>
                    </div>


                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">
                            Paid
                        </p>

                        <p className="text-2xl font-bold text-green-600 mt-1">
                            {statistics.paid_loans}
                        </p>
                    </div>


                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">
                            Closed
                        </p>

                        <p className="text-2xl font-bold text-gray-600 mt-1">
                            {statistics.closed_loans}
                        </p>
                    </div>

                </div>


                {/* ================================================= */}
                {/* LOANS */}
                {/* ================================================= */}

                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                    <div className="px-6 py-5 border-b border-gray-200">

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    My Loans
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    View your loan accounts and payment history
                                </p>
                            </div>

                            <span className="text-sm text-gray-500">
                                {loans.length} loan{loans.length !== 1 ? "s" : ""}
                            </span>

                        </div>

                    </div>


                    {loans.length === 0 ? (

                        <div className="py-16 text-center">

                            <div className="text-4xl mb-3">
                                📄
                            </div>

                            <h3 className="font-semibold text-gray-800">
                                No loans yet
                            </h3>

                            <p className="text-gray-500 text-sm mt-1">
                                Your loan records will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y divide-gray-100">

                            {loans.map((loan) => (

                                <div
                                    key={loan.id}
                                    className="p-6 hover:bg-gray-50 transition"
                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                        {/* Loan Info */}

                                        <div className="flex-1">

                                            <div className="flex flex-wrap items-center gap-3 mb-2">

                                                <h3 className="font-bold text-gray-900">
                                                    Loan #{loan.id}
                                                </h3>

                                                <span className="text-sm text-gray-500">
                                                    {loan.loan_type || "Loan"}
                                                </span>

                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                                                        loan.status
                                                    )}`}
                                                >
                                                    {loan.status}
                                                </span>

                                            </div>


                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Principal
                                                    </p>

                                                    <p className="font-semibold text-gray-800">
                                                        {formatCurrency(
                                                            loan.principalAmount
                                                        )}
                                                    </p>
                                                </div>


                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Total Due
                                                    </p>

                                                    <p className="font-semibold text-gray-800">
                                                        {formatCurrency(
                                                            loan.totalDue
                                                        )}
                                                    </p>
                                                </div>


                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Paid
                                                    </p>

                                                    <p className="font-semibold text-green-600">
                                                        {formatCurrency(
                                                            loan.total_paid
                                                        )}
                                                    </p>
                                                </div>


                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        Remaining
                                                    </p>

                                                    <p className="font-semibold text-red-600">
                                                        {formatCurrency(
                                                            loan.remaining_balance
                                                        )}
                                                    </p>
                                                </div>

                                            </div>

                                        </div>


                                        {/* Due Date */}

                                        <div className="lg:text-right">

                                            <p className="text-xs text-gray-400">
                                                Due Date
                                            </p>

                                            <p className="font-semibold text-gray-800 mt-1">
                                                {formatDate(loan.due_date)}
                                            </p>

                                            <button
                                                onClick={() =>
                                                    setSelectedLoan(loan)
                                                }
                                                className="mt-3 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-lg transition"
                                            >
                                                View Details
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>


                {/* ================================================= */}
                {/* MEMBER + LOANER INFO */}
                {/* ================================================= */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    {/* Member Information */}

                    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                        <h2 className="font-bold text-gray-900 mb-5">
                            My Information
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <div>
                                <p className="text-xs text-gray-400">
                                    Full Name
                                </p>

                                <p className="font-medium text-gray-800 mt-1">
                                    {member.full_name}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs text-gray-400">
                                    Username
                                </p>

                                <p className="font-medium text-gray-800 mt-1">
                                    {member.username}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs text-gray-400">
                                    Age
                                </p>

                                <p className="font-medium text-gray-800 mt-1">
                                    {member.age || "—"}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs text-gray-400">
                                    Contact
                                </p>

                                <p className="font-medium text-gray-800 mt-1">
                                    {member.contact || "—"}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs text-gray-400">
                                    Source of Income
                                </p>

                                <p className="font-medium text-gray-800 mt-1">
                                    {member.source_of_income || "—"}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs text-gray-400">
                                    Address
                                </p>

                                <p className="font-medium text-gray-800 mt-1">
                                    {[
                                        member.subd,
                                        member.brgy,
                                        member.city,
                                        member.province,
                                    ]
                                        .filter(Boolean)
                                        .join(", ") || "—"}
                                </p>
                            </div>

                        </div>

                    </section>


                    {/* Loaner Information */}

                    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                        <h2 className="font-bold text-gray-900 mb-5">
                            Loan Provider
                        </h2>

                        <div className="space-y-5">

                            <div>
                                <p className="text-xs text-gray-400">
                                    Name
                                </p>

                                <p className="font-medium text-gray-800 mt-1">
                                    {loaner.full_name || "—"}
                                </p>
                            </div>


                            <div>
                                <p className="text-xs text-gray-400">
                                    Username
                                </p>

                                <p className="font-medium text-gray-800 mt-1">
                                    {loaner.username || "—"}
                                </p>
                            </div>


                            <div className="pt-4 border-t border-gray-100">

                                <p className="text-xs text-gray-400">
                                    Total Amount Due
                                </p>

                                <p className="text-xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(balance.total_due)}
                                </p>

                            </div>

                        </div>

                    </section>

                </div>

            </main>


            {/* ===================================================== */}
            {/* LOAN DETAILS MODAL */}
            {/* ===================================================== */}

            {selectedLoan && (

                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedLoan(null)}
                >

                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Modal Header */}

                        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-gray-900">
                                    Loan #{selectedLoan.id}
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedLoan.loan_type || "Loan Details"}
                                </p>

                            </div>

                            <button
                                onClick={() => setSelectedLoan(null)}
                                className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500 text-xl"
                            >
                                ×
                            </button>

                        </div>


                        {/* Loan Summary */}

                        <div className="p-6">

                            <div className="grid grid-cols-2 gap-4">

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-400">
                                        Principal
                                    </p>

                                    <p className="font-bold text-gray-900 mt-1">
                                        {formatCurrency(
                                            selectedLoan.principalAmount
                                        )}
                                    </p>
                                </div>


                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-400">
                                        Total Due
                                    </p>

                                    <p className="font-bold text-gray-900 mt-1">
                                        {formatCurrency(
                                            selectedLoan.totalDue
                                        )}
                                    </p>
                                </div>


                                <div className="bg-green-50 rounded-xl p-4">
                                    <p className="text-xs text-green-600">
                                        Total Paid
                                    </p>

                                    <p className="font-bold text-green-700 mt-1">
                                        {formatCurrency(
                                            selectedLoan.total_paid
                                        )}
                                    </p>
                                </div>


                                <div className="bg-red-50 rounded-xl p-4">
                                    <p className="text-xs text-red-600">
                                        Remaining
                                    </p>

                                    <p className="font-bold text-red-700 mt-1">
                                        {formatCurrency(
                                            selectedLoan.remaining_balance
                                        )}
                                    </p>
                                </div>

                            </div>


                            {/* Loan Details */}

                            <div className="mt-6">

                                <h3 className="font-bold text-gray-900 mb-4">
                                    Loan Details
                                </h3>

                                <div className="grid grid-cols-2 gap-4 text-sm">

                                    <div>
                                        <p className="text-gray-400">
                                            Status
                                        </p>

                                        <span
                                            className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                                                selectedLoan.status
                                            )}`}
                                        >
                                            {selectedLoan.status}
                                        </span>
                                    </div>


                                    <div>
                                        <p className="text-gray-400">
                                            Due Date
                                        </p>

                                        <p className="font-medium text-gray-800 mt-1">
                                            {formatDate(
                                                selectedLoan.due_date
                                            )}
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-gray-400">
                                            Interest Rate
                                        </p>

                                        <p className="font-medium text-gray-800 mt-1">
                                            {selectedLoan.interest_rate != null
                                                ? `${selectedLoan.interest_rate}%`
                                                : "—"}
                                        </p>
                                    </div>

                                </div>

                            </div>


                            {/* Payment History */}

                            <div className="mt-8">

                                <div className="flex items-center justify-between mb-4">

                                    <h3 className="font-bold text-gray-900">
                                        Payment History
                                    </h3>

                                    <span className="text-sm text-gray-500">
                                        {selectedLoan.payments?.length || 0} payment
                                        {selectedLoan.payments?.length !== 1
                                            ? "s"
                                            : ""}
                                    </span>

                                </div>


                                {!selectedLoan.payments ||
                                    selectedLoan.payments.length === 0 ? (

                                    <div className="bg-gray-50 rounded-xl p-6 text-center">

                                        <p className="text-gray-500 text-sm">
                                            No payments recorded yet.
                                        </p>

                                    </div>

                                ) : (

                                    <div className="border border-gray-200 rounded-xl overflow-hidden">

                                        <div className="divide-y divide-gray-100">

                                            {selectedLoan.payments.map(
                                                (payment) => (

                                                    <div
                                                        key={payment.id}
                                                        className="p-4 flex items-center justify-between"
                                                    >

                                                        <div>

                                                            <p className="font-medium text-gray-800">
                                                                Payment
                                                            </p>

                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {formatDate(
                                                                    payment.payment_date
                                                                )}
                                                            </p>

                                                            {payment.collected_by && (
                                                                <p className="text-xs text-gray-400">
                                                                    Collected by:{" "}
                                                                    {
                                                                        payment.collected_by
                                                                    }
                                                                </p>
                                                            )}

                                                        </div>


                                                        <p className="font-bold text-green-600">
                                                            +
                                                            {formatCurrency(
                                                                payment.amount_paid
                                                            )}
                                                        </p>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}

                            </div>

                        </div>


                        {/* Modal Footer */}

                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">

                            <button
                                onClick={() => setSelectedLoan(null)}
                                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm transition"
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

export default MemberHome;