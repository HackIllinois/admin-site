import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import React, { useEffect, useState, useCallback } from 'react';
import styles from './style.module.scss';
import { AuthService, StaffService } from '@/generated';
import { useParams } from 'react-router-dom';

const CheckinPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // Close/snuff out any snackbar
  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setLoading(false);
    // setSuccess(false);
    setError(false);
  };

  const handleLogout = () => {
    AuthService.postAuthLogout().then(() => window.location.reload())
  };

  // Performs the check-in
  const handleCheckinUser = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const response = await StaffService.postStaffAttendance({
        body: { eventId },
      });
      if (response.data?.success) {
        setSuccess(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Kick off check-in on mount
  useEffect(() => {
    handleCheckinUser();
  }, [handleCheckinUser]);

  return (
    <div className={styles.container}>
      {/* ICON + MAIN MESSAGE */}
      <div className={styles.header}>
        {loading ? (
          <CircularProgress />
        ) : success ? (
          <CheckCircleIcon className={styles.icon} fontSize="large" />
        ) : (
          <ErrorIcon className={styles.errorIcon} fontSize="large" />
        )}

        <h1 className={styles.message}>
          {loading
            ? 'Checking you in…'
            : success
            ? 'You are checked in!'
            : 'Check-in failed'}
        </h1>
        <h3 className={styles.submessage}>
          {loading
            ? 'Just a second…'
            : success
            ? 'You can leave this page.'
            : 'Please log out and try again.'}
        </h3>

      {error && 
        <button 
          className={styles.logoutButton} 
          onClick={handleLogout}
          type="button"
        >
          Log out
        </button>
      } 
      </div>

      {/* LOADING / SUCCESS / ERROR TOASTS */}
      {/* (These are optional now that the header reflects state, but kept for extra feedback) */}

      <Snackbar
        open={loading}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert elevation={6} variant="filled" onClose={handleClose} severity="info">
          Checking you in…
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert elevation={6} variant="filled" onClose={handleClose} severity="success">
          Successfully checked in!
        </Alert>
      </Snackbar>

      <Snackbar
        open={error}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert elevation={6} variant="filled" onClose={handleClose} severity="error">
          Oops, check-in failed. Please try again.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CheckinPage;
