// Package apperror defines typed application errors that carry no
// knowledge of HTTP. Adapters (e.g. internal/platform/httpserver) map
// these to transport-specific responses; domain and application code
// only ever deals with *Error.
package apperror

import (
	"errors"
	"fmt"
	"net/http"
)

// Code categorizes an error independently of any transport.
type Code string

const (
	CodeNotFound     Code = "not_found"
	CodeConflict     Code = "conflict"
	CodeInvalid      Code = "invalid"
	CodeUnauthorized Code = "unauthorized"
	CodeForbidden    Code = "forbidden"
	CodeInternal     Code = "internal"
)

// Error is the typed error every layer above domain should produce and
// propagate with %w rather than a bare error or panic.
type Error struct {
	Code    Code
	Message string
	// Fields holds per-field validation failures, e.g. {"email": "already registered"}.
	Fields map[string]string
	Err    error
}

func (e *Error) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (e *Error) Unwrap() error { return e.Err }

func newErr(code Code, message string, err error) *Error {
	return &Error{Code: code, Message: message, Err: err}
}

func NotFound(message string) *Error     { return newErr(CodeNotFound, message, nil) }
func Conflict(message string) *Error     { return newErr(CodeConflict, message, nil) }
func Unauthorized(message string) *Error { return newErr(CodeUnauthorized, message, nil) }
func Forbidden(message string) *Error    { return newErr(CodeForbidden, message, nil) }

// Internal wraps an unexpected/infrastructure error. The wrapped error's
// message is never sent to a client (see pkg/response) — only logged.
func Internal(err error) *Error {
	return newErr(CodeInternal, "internal error", err)
}

// NewInvalid builds a validation error from a set of field->reason pairs.
func NewInvalid(fields map[string]string) *Error {
	return &Error{Code: CodeInvalid, Message: "validation failed", Fields: fields}
}

// As reports whether err is (or wraps) an *Error, mirroring errors.As.
func As(err error) (*Error, bool) {
	var appErr *Error
	if errors.As(err, &appErr) {
		return appErr, true
	}
	return nil, false
}

// HTTPStatus maps err to a status code. Errors that aren't *Error (or don't
// wrap one) are treated as internal — 500, never a guess at 4xx.
func HTTPStatus(err error) int {
	appErr, ok := As(err)
	if !ok {
		return http.StatusInternalServerError
	}
	switch appErr.Code {
	case CodeNotFound:
		return http.StatusNotFound
	case CodeConflict:
		return http.StatusConflict
	case CodeInvalid:
		return http.StatusUnprocessableEntity
	case CodeUnauthorized:
		return http.StatusUnauthorized
	case CodeForbidden:
		return http.StatusForbidden
	default:
		return http.StatusInternalServerError
	}
}
