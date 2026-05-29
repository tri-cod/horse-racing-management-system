import "./RoleForm.css";

function HorseOwnerForm({ fields, onChange, onSubmit, loading, error, success }) {
    return (
        <form className="role-form" onSubmit={(e) => onSubmit(e, "HORSE_OWNER")}>
            {error && <p className="role-form__message role-form__message--error">{error}</p>}
            {success && <p className="role-form__message role-form__message--success">{success}</p>}

            <div className="role-form__row">
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="ho-username">Username</label>
                    <input
                        className="role-form__input"
                        type="text"
                        id="ho-username"
                        value={fields.username}
                        onChange={(e) => onChange("username", e.target.value)}
                        placeholder="Enter username"
                        required
                    />
                </div>
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="ho-fullName">Full Name</label>
                    <input
                        className="role-form__input"
                        type="text"
                        id="ho-fullName"
                        value={fields.fullName}
                        onChange={(e) => onChange("fullName", e.target.value)}
                        placeholder="Enter full name"
                        required
                    />
                </div>
            </div>

            <div className="role-form__row">
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="ho-email">Email</label>
                    <input
                        className="role-form__input"
                        type="email"
                        id="ho-email"
                        value={fields.email}
                        onChange={(e) => onChange("email", e.target.value)}
                        placeholder="Enter email"
                        required
                    />
                </div>
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="ho-phone">Phone</label>
                    <input
                        className="role-form__input"
                        type="tel"
                        id="ho-phone"
                        value={fields.phone}
                        onChange={(e) => onChange("phone", e.target.value)}
                        placeholder="Enter phone number"
                        pattern="^[0-9]{10,11}$"
                    />
                </div>
            </div>

            <div className="role-form__row">
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="ho-password">Password</label>
                    <input
                        className="role-form__input"
                        type="password"
                        id="ho-password"
                        value={fields.password}
                        onChange={(e) => onChange("password", e.target.value)}
                        placeholder="Min. 8 characters"
                        minLength={8}
                        required
                    />
                </div>
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="ho-confirm">Confirm Password</label>
                    <input
                        className="role-form__input"
                        type="password"
                        id="ho-confirm"
                        value={fields.confirmPassword}
                        onChange={(e) => onChange("confirmPassword", e.target.value)}
                        placeholder="Re-enter password"
                        required
                    />
                </div>
            </div>

            <button className="role-form__submit" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register as Horse Owner"}
            </button>
        </form>
    );
}

export default HorseOwnerForm;