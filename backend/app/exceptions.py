class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, resource: str) -> None:
        super().__init__(404, "NOT_FOUND", f"{resource} not found")


class ForbiddenError(AppError):
    def __init__(self) -> None:
        super().__init__(403, "FORBIDDEN", "You do not have permission to perform this action")


class UnauthorizedError(AppError):
    def __init__(self) -> None:
        super().__init__(401, "UNAUTHORIZED", "Authentication required")


class ValidationError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(422, "VALIDATION_ERROR", message)


class ConflictError(AppError):
    def __init__(self, message: str) -> None:
        super().__init__(409, "CONFLICT", message)


class InvalidCredentialsError(AppError):
    def __init__(self) -> None:
        super().__init__(401, "INVALID_CREDENTIALS", "Invalid email or password")
