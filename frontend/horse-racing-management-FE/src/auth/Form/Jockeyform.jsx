import "../../assets/css/Roleform.css";

function JockeyForm({ fields, onChange, onSubmit, loading, error, success }) {
    return (
        <form className="role-form" onSubmit={(e) => onSubmit(e, "JOCKEY")}>
            {error && <p className="role-form__message role-form__message--error">{error}</p>}
            {success && <p className="role-form__message role-form__message--success">{success}</p>}

            <div className="role-form__row">
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="jk-username">Username</label>
                    <input
                        className="role-form__input"
                        type="text"
                        id="jk-username"
                        value={fields.username}
                        onChange={(e) => onChange("username", e.target.value)}
                        placeholder="Enter username"
                        required
                    />
                </div>
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="jk-fullName">Full Name</label>
                    <input
                        className="role-form__input"
                        type="text"
                        id="jk-fullName"
                        value={fields.fullName}
                        onChange={(e) => onChange("fullName", e.target.value)}
                        placeholder="Enter full name"
                        required
                    />
                </div>
            </div>

            <div className="role-form__row">
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="jk-email">Email</label>
                    <input
                        className="role-form__input"
                        type="email"
                        id="jk-email"
                        value={fields.email}
                        onChange={(e) => onChange("email", e.target.value)}
                        placeholder="Enter email"
                        required
                    />
                </div>
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="jk-phone">Phone</label>
                    <input
                        className="role-form__input"
                        type="tel"
                        id="jk-phone"
                        value={fields.phone}
                        onChange={(e) => onChange("phone", e.target.value)}
                        placeholder="Enter phone number"
                        pattern="^[0-9]{10,11}$"
                    />
                </div>
            </div>

            <div className="role-form__row">
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="jk-password">Password</label>
                    <input
                        className="role-form__input"
                        type="password"
                        id="jk-password"
                        value={fields.password}
                        onChange={(e) => onChange("password", e.target.value)}
                        placeholder="Min. 8 characters"
                        minLength={8}
                        required
                    />
                </div>
                <div className="role-form__group">
                    <label className="role-form__label" htmlFor="jk-confirm">Confirm Password</label>
                    <input
                        className="role-form__input"
                        type="password"
                        id="jk-confirm"
                        value={fields.confirmPassword}
                        onChange={(e) => onChange("confirmPassword", e.target.value)}
                        placeholder="Re-enter password"
                        required
                    />
                </div>
            </div>

            <button className="role-form__submit" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register as Jockey"}
            </button>
        </form>
    );
}

export default JockeyForm;