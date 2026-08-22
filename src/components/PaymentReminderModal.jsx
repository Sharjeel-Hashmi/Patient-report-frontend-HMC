import { useState } from 'react';

// Hardcoded payment details — update/remove once payment is received
const PAYMENT_DETAILS = {
  amount: '€2,070',
  dueDate: '31st August 2026',
};

export default function PaymentReminderModal() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
        <h2 style={titleStyle}>Payment Reminder</h2>

        <p style={textStyle}>
          An outstanding balance of <strong>{PAYMENT_DETAILS.amount}</strong> is
          due on this account.
        </p>

        <p style={textStyle}>
          Please arrange payment by <strong>{PAYMENT_DETAILS.dueDate}</strong> to
          avoid interruption of service. If payment is not received by this
          date, access to the HMC Thyroid Tracker system will be automatically
          suspended until the balance is settled.
        </p>

        <p style={{ ...textStyle, fontSize: '15px', color: '#6b7280' }}>
          For any questions regarding this invoice, please contact WebPalm.
        </p>

        <div style={buttonRowStyle}>
          <a
            href="mailto:billing@webpalm.ie?subject=HMC%20Thyroid%20Tracker%20-%20Payment%20Query"
            style={contactButtonStyle}
          >
            Contact WebPalm
          </a>
          <button onClick={() => setVisible(false)} style={dismissButtonStyle}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '14px',
  padding: '40px',
  maxWidth: '560px',
  width: '90%',
  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  textAlign: 'left',
};

const titleStyle = {
  fontSize: '26px',
  fontWeight: 700,
  margin: '0 0 20px 0',
  color: '#111827',
};

const textStyle = {
  fontSize: '17px',
  lineHeight: 1.6,
  color: '#374151',
  marginBottom: '16px',
};

const buttonRowStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '20px',
  justifyContent: 'flex-end',
};

const contactButtonStyle = {
  padding: '10px 20px',
  borderRadius: '6px',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 500,
  textDecoration: 'none',
  cursor: 'pointer',
};

const dismissButtonStyle = {
  padding: '10px 20px',
  borderRadius: '6px',
  backgroundColor: '#f3f4f6',
  color: '#374151',
  fontSize: '16px',
  fontWeight: 500,
  border: 'none',
  cursor: 'pointer',
};