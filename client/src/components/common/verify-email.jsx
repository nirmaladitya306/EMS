import { Link } from 'react-router-dom'
import { ErrorPopup } from '../../components/common/error-popup'

export const ResetVerifyEmailPage = ({
  handleverifyemail,
  handleverifybutton,
  emailvalue,
  targetstate
}) => {
  return (
    <>
      {targetstate?.error?.status && (
        <ErrorPopup error={targetstate.error.message} />
      )}

      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div>
          <h1>Verify your email</h1>

          <input
            type="email"
            value={emailvalue}
            onChange={handleverifyemail}
          />

          <button onClick={handleverifybutton}>
            Send verification email
          </button>

          <Link to="/">Back</Link>
        </div>
      </div>
    </>
  )
}