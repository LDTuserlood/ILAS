import Swal from 'sweetalert2';

/**
 * Hiển thị thông báo thành công
 */
export const showSuccess = (message, title = 'Thành công!') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#1a5ca6',
    timer: 3000,
    timerProgressBar: true,
    toast: false,
    position: 'center'
  });
};

/**
 * Hiển thị thông báo lỗi
 */
export const showError = (message, title = 'Lỗi!') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonText: 'Đóng',
    confirmButtonColor: '#dc3545',
    toast: false,
    position: 'center'
  });
};

/**
 * Hiển thị thông báo cảnh báo
 */
export const showWarning = (message, title = 'Cảnh báo!') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ff9800',
    toast: false,
    position: 'center'
  });
};

/**
 * Hiển thị thông báo thông tin
 */
export const showInfo = (message, title = 'Thông tin') => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#17a2b8',
    timer: 3000,
    timerProgressBar: true,
    toast: false,
    position: 'center'
  });
};

/**
 * Hiển thị xác nhận
 */
export const showConfirm = (message, title = 'Xác nhận') => {
  return Swal.fire({
    title: title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#1a5ca6',
    cancelButtonColor: '#6c757d',
    reverseButtons: true,
    toast: false,
    position: 'center'
  });
};

/**
 * Hiển thị loading
 */
export const showLoading = (message = 'Đang xử lý...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

/**
 * Đóng loading
 */
export const closeLoading = () => {
  Swal.close();
};

