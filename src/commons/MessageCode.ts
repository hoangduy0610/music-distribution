export enum MessageCode {
	USER_NOT_FOUND = 'Không tìm thấy thông tin người dùng',
	USER_NOT_REGISTER = 'Bạn chưa đăng ký dịch vụ, vui lòng liên hệ hotline 0363892409 để đăng ký',
	USER_IS_DELETED = 'Tài khoản đã bị khóa',
	USER_ALREADY_EXISTED = 'Tên người dùng đã tồn tại trong hệ thống',
	USER_CREATE_OAUTH_ERROR = 'Không thể đăng ký ngay lúc này',
	ERROR_USER_OAUTH_AUTH = 'Tên người dùng hoặc mật khẩu không chính xác',
	ERROR_USER_NOT_HAVE_PERMISSION = 'Bạn không có quyền truy cập chức năng này',
	A_SERVICE_UNAVAILABLE = 'Dịch vụ tạm thời không khả dụng, vui lòng thử lại sau',
	INVALID_TOKEN = 'Token không hợp lệ hoặc đã hết hạn',
}
