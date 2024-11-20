import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const Alert = ({ message, type }) => {
  React.useEffect(() => {
    if (message) {
      if (type === 'success') {
        toast.success(message, {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 3000,
        });
      } else if (type === 'error') {
        toast.error(message, {
          position: toast.POSITION.BOTTOM_RIGHT,
          autoClose: 3000,
        });
      }
    }
  }, [message, type]);

  return null; 
};

Alert.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error']).isRequired,
};

export default Alert;
