import React, { useEffect, useState } from "react";
import '../styles/borrower.css';
import {API_BASE_URL} from '../../../config.js';


const Members = (props) => {
    const token = localStorage.getItem("loaner_token");

    const authHeaders = {
        Authorization: `Bearer ${token}`,
    };
    const [members, setMembers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const [selectedMember, setSelectedMember] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const [form, setForm] = useState({
        firstname: "",
        lastname: "",
        age: "",
        source_of_income: "",
        province: "",
        city: "",
        brgy: "",
        subd: "",
        contact: "",
        status: "pending",
    });

    // =========================================================
    // FETCH MEMBERS
    // =========================================================

    const fetchMembers = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page,
                limit,
            });

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (status) {
                params.append("status", status);
            }

            const response = await fetch(
                `${API_BASE_URL}/members?${params.toString()}`,{
                    method: "GET",
                    headers: authHeaders,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch members");
            }

            const data = await response.json();

            /*
                Expected backend response:

                {
                    success: true,
                    members: [],
                    total: 100
                }

                If your controller returns a different structure,
                just change these two lines.
            */

            setMembers(data.members || data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Fetch members error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [page, status]);

    // =========================================================
    // SEARCH
    // =========================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchMembers();
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // =========================================================
    // FORM
    // =========================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm({
            firstname: "",
            lastname: "",
            age: "",
            source_of_income: "",
            province: "",
            city: "",
            brgy: "",
            subd: "",
            contact: "",
            status: "pending",
        });

        setEditingMember(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (member) => {
        setEditingMember(member);

        setForm({
            firstname: member.firstname || "",
            lastname: member.lastname || "",
            age: member.age || "",
            source_of_income: member.source_of_income || "",
            province: member.province || "",
            city: member.city || "",
            brgy: member.brgy || "",
            subd: member.subd || "",
            contact: member.contact || "",
            status: member.status || "pending",
        });

        setShowModal(true);
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            const isEdit = Boolean(editingMember);

            const url = isEdit
                ? `${API_BASE_URL}/members/${editingMember.id}`
                : `${API_BASE_URL}/members`;

            const method = isEdit ? "PUT" : "POST";

            const payload = {
                ...form,
                status: (isEdit ? form.status : 'Pending'),
                loaner_id: props?.id
                    ? Number(props?.id)
                    : null,
                age: form.age ? Number(form.age) : null,
            };

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to save member"
                );
            }

            alert(
                isEdit
                    ? "Member updated successfully."
                    : "Member created successfully."
            );

            setShowModal(false);
            resetForm();

            fetchMembers();
        } catch (error) {
            console.error("Save member error:", error);
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // APPROVE
    // =========================================================

    const approveMember = async (id) => {
        const confirmApprove = window.confirm(
            "Are you sure you want to approve this member?"
        );

        if (!confirmApprove) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/members/${id}/approve`,
                {
                    method: "PATCH",
                    headers: authHeaders,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to approve member"
                );
            }

            fetchMembers();
        } catch (error) {
            console.error("Approve member error:", error);
            alert(error.message);
        }
    };

    // =========================================================
    // DELETE
    // =========================================================

    const deleteMember = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this member?\n\nThis action cannot be undone."
        );

        if (!confirmDelete) return;

        try {
            const response = await fetch(
                `${API_BASE_URL}/members/${id}`,
                {
                    method: "DELETE",
                    headers: authHeaders
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete member"
                );
            }

            fetchMembers();
        } catch (error) {
            console.error("Delete member error:", error);
            alert(error.message);
        }
    };

    // =========================================================
    // DETAILS
    // =========================================================

    const openDetails = (member) => {
        setSelectedMember(member);
        setShowDetails(true);
    };

    // =========================================================
    // PAGINATION
    // =========================================================

    const totalPages = Math.ceil(total / limit);

    const goToPage = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;

        setPage(newPage);
    };

    // =========================================================
    // STATUS
    // =========================================================

    const getStatusClass = (value) => {
        switch (value) {
            case "approved":
                return "status approved";

            case "pending":
                return "status pending";

            case "rejected":
                return "status rejected";

            case "blacklisted":
                return "status blacklisted";

            default:
                return "status";
        }
    };

    return (
        <div className="members-container">

            {/* HEADER */}

            <div className="members-header">

                <div>
                    <h1>Members</h1>
                    <p>Manage your loan members</p>
                </div>

                <button
                    className="add-member-btn"
                    onClick={openAddModal}
                >
                    + Add Member
                </button>

            </div>


            {/* FILTERS */}

            <div className="members-toolbar">

                <div className="search-box">

                    <span>⌕</span>

                    <input
                        type="text"
                        placeholder="Search members..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="blacklisted">
                        Blacklisted
                    </option>
                </select>

            </div>


            {/* TABLE */}

            <div className="members-table-wrapper">

                <table className="members-table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Member</th>
                            <th>Contact</th>
                            <th>Address</th>
                            <th>Income</th>
                            <th>Loans</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td
                                    colSpan="8"
                                    className="table-message"
                                >
                                    Loading members...
                                </td>
                            </tr>

                        ) : members.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="8"
                                    className="table-message"
                                >
                                    No members found.
                                </td>
                            </tr>

                        ) : (

                            members.map((member) => (

                                <tr key={member.id}>

                                    <td>
                                        #{member.id}
                                    </td>

                                    <td>

                                        <div className="member-name">
                                            <div className="member-avatar">
                                                {member.firstname
                                                    ?.charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <strong>
                                                    {member.firstname}{" "}
                                                    {member.lastname}
                                                </strong>

                                                <small>
                                                    Age {member.age || "N/A"}
                                                </small>
                                            </div>
                                        </div>

                                    </td>

                                    <td>
                                        {member.contact || "N/A"}
                                    </td>

                                    <td>

                                        <div className="address-cell">

                                            <span>
                                                {member.city ||
                                                    member.province ||
                                                    "N/A"}
                                            </span>

                                            {member.brgy && (
                                                <small>
                                                    {member.brgy}
                                                </small>
                                            )}

                                        </div>

                                    </td>

                                    <td>
                                        {member.source_of_income ||
                                            "N/A"}
                                    </td>

                                    <td>

                                        <div className="loan-count">

                                            <span>
                                                {member.total_loans || 0}
                                            </span>

                                            {Number(
                                                member.active_loans
                                            ) > 0 && (
                                                <small>
                                                    {
                                                        member.active_loans
                                                    }{" "}
                                                    active
                                                </small>
                                            )}

                                        </div>

                                    </td>

                                    <td>

                                        <span
                                            className={getStatusClass(
                                                member.status
                                            )}
                                        >
                                            {member.status}
                                        </span>

                                    </td>

                                    <td>

                                        <div className="action-buttons">

                                            <button
                                                className="view-btn"
                                                onClick={() =>
                                                    openDetails(
                                                        member
                                                    )
                                                }
                                                title="View"
                                            >
                                                View
                                            </button>

                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    openEditModal(
                                                        member
                                                    )
                                                }
                                                title="Edit"
                                            >
                                                Edit
                                            </button>

                                            {member.status ===
                                                "pending" && (
                                                <button
                                                    className="approve-btn"
                                                    onClick={() =>
                                                        approveMember(
                                                            member.id
                                                        )
                                                    }
                                                >
                                                    Approve
                                                </button>
                                            )}

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    deleteMember(
                                                        member.id
                                                    )
                                                }
                                                title="Delete"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>


            {/* PAGINATION */}

            <div className="members-pagination">

                <span>
                    Showing{" "}
                    {members.length === 0
                        ? 0
                        : (page - 1) * limit + 1}{" "}
                    -{" "}
                    {Math.min(
                        page * limit,
                        total
                    )}{" "}
                    of {total}
                </span>

                <div className="pagination-buttons">

                    <button
                        disabled={page === 1}
                        onClick={() =>
                            goToPage(page - 1)
                        }
                    >
                        ‹
                    </button>

                    {Array.from(
                        {
                            length: Math.min(
                                totalPages,
                                5
                            ),
                        },
                        (_, index) => {

                            let pageNumber;

                            if (totalPages <= 5) {
                                pageNumber = index + 1;
                            } else if (page <= 3) {
                                pageNumber = index + 1;
                            } else if (
                                page >=
                                totalPages - 2
                            ) {
                                pageNumber =
                                    totalPages -
                                    4 +
                                    index;
                            } else {
                                pageNumber =
                                    page - 2 + index;
                            }

                            return (
                                <button
                                    key={pageNumber}
                                    className={
                                        page === pageNumber
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        goToPage(
                                            pageNumber
                                        )
                                    }
                                >
                                    {pageNumber}
                                </button>
                            );
                        }
                    )}

                    <button
                        disabled={
                            page === totalPages ||
                            totalPages === 0
                        }
                        onClick={() =>
                            goToPage(page + 1)
                        }
                    >
                        ›
                    </button>

                </div>

            </div>


            {/* ADD / EDIT MODAL */}

            {showModal && (

                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowModal(false)
                    }
                >

                    <div
                        className="member-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="modal-header">

                            <div>
                                <h2>
                                    {editingMember
                                        ? "Edit Member"
                                        : "Add Member"}
                                </h2>

                                <p>
                                    {editingMember
                                        ? "Update member information"
                                        : "Create a new member"}
                                </p>
                            </div>

                            <button
                                className="close-btn"
                                onClick={() =>
                                    setShowModal(false)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={handleSubmit}>

                            <div className="form-grid">


                                <div className="form-group">

                                    <label>
                                        Age
                                    </label>

                                    <input
                                        type="number"
                                        name="age"
                                        value={
                                            form.age
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        min="1"
                                        max="120"
                                        placeholder="Age"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        First Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="firstname"
                                        value={
                                            form.firstname
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="First name"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Last Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="lastname"
                                        value={
                                            form.lastname
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Last name"
                                    />

                                </div>


                                <div className="form-group">
                                    <label>
                                        Source of Income
                                    </label>

                                    <select
                                        name="source_of_income"
                                        value={form.source_of_income}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select source of income</option>
                                        <option value="Salary">Salary</option>
                                        <option value="Business">Business</option>
                                        <option value="Remittance">Remittance</option>
                                        <option value="Pension">Pension</option>
                                        <option value="Commission">Commission</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Allowance">Allowance</option>
                                    </select>
                                </div>


                                <div className="form-group">

                                    <label>
                                        Contact
                                    </label>

                                    <input
                                        type="text"
                                        name="contact"
                                        value={
                                            form.contact
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="09XXXXXXXXX"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Province
                                    </label>

                                    <input
                                        type="text"
                                        name="province"
                                        value={
                                            form.province
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Province"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={
                                            form.city
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="City"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Barangay
                                    </label>

                                    <input
                                        type="text"
                                        name="brgy"
                                        value={
                                            form.brgy
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Barangay"
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Subdivision
                                    </label>

                                    <input
                                        type="text"
                                        name="subd"
                                        value={
                                            form.subd
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Subdivision"
                                    />

                                </div>


                                {editingMember && 
                                <div className="form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            form.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="pending">
                                            Pending
                                        </option>

                                        <option value="approved">
                                            Approved
                                        </option>

                                        <option value="rejected">
                                            Rejected
                                        </option>

                                        <option value="blacklisted">
                                            Blacklisted
                                        </option>
                                    </select>

                                </div>
                                }

                            </div>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        setShowModal(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingMember
                                        ? "Update Member"
                                        : "Create Member"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* DETAILS MODAL */}

            {showDetails &&
                selectedMember && (

                    <div
                        className="modal-overlay"
                        onClick={() =>
                            setShowDetails(false)
                        }
                    >

                        <div
                            className="details-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <div>
                                    <h2>
                                        Member Details
                                    </h2>

                                    <p>
                                        #{selectedMember.id}
                                    </p>
                                </div>

                                <button
                                    className="close-btn"
                                    onClick={() =>
                                        setShowDetails(
                                            false
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>


                            <div className="profile-section">

                                <div className="large-avatar">
                                    {selectedMember.firstname
                                        ?.charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div>

                                    <h3>
                                        {
                                            selectedMember.firstname
                                        }{" "}
                                        {
                                            selectedMember.lastname
                                        }
                                    </h3>

                                    <span
                                        className={getStatusClass(
                                            selectedMember.status
                                        )}
                                    >
                                        {
                                            selectedMember.status
                                        }
                                    </span>

                                </div>

                            </div>


                            <div className="details-grid">

                                <div>
                                    <label>
                                        Age
                                    </label>
                                    <strong>
                                        {
                                            selectedMember.age ||
                                            "N/A"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <label>
                                        Contact
                                    </label>
                                    <strong>
                                        {
                                            selectedMember.contact ||
                                            "N/A"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <label>
                                        Source of Income
                                    </label>
                                    <strong>
                                        {
                                            selectedMember.source_of_income ||
                                            "N/A"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <label>
                                        Loaner ID
                                    </label>
                                    <strong>
                                        {
                                            selectedMember.loaner_id ||
                                            "N/A"
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <label>
                                        Total Loans
                                    </label>
                                    <strong>
                                        {
                                            selectedMember.total_loans ||
                                            0
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <label>
                                        Active Loans
                                    </label>
                                    <strong>
                                        {
                                            selectedMember.active_loans ||
                                            0
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <label>
                                        Overdue Loans
                                    </label>
                                    <strong>
                                        {
                                            selectedMember.overdue_loans ||
                                            0
                                        }
                                    </strong>
                                </div>

                            </div>


                            <div className="address-details">

                                <h4>
                                    Address
                                </h4>

                                <p>
                                    {selectedMember.subd &&
                                        `${selectedMember.subd}, `}
                                    {selectedMember.brgy &&
                                        `${selectedMember.brgy}, `}
                                    {selectedMember.city &&
                                        `${selectedMember.city}, `}
                                    {
                                        selectedMember.province
                                    }
                                </p>

                            </div>


                            <div className="details-actions">

                                <button
                                    className="edit-btn"
                                    onClick={() => {
                                        setShowDetails(
                                            false
                                        );

                                        openEditModal(
                                            selectedMember
                                        );
                                    }}
                                >
                                    Edit Member
                                </button>

                                {selectedMember.status ===
                                    "pending" && (
                                    <button
                                        className="approve-btn"
                                        onClick={() => {
                                            setShowDetails(
                                                false
                                            );

                                            approveMember(
                                                selectedMember.id
                                            );
                                        }}
                                    >
                                        Approve
                                    </button>
                                )}

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
};

export default Members;