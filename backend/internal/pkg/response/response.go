// Package response provides the one JSON envelope every HTTP adapter in
// every module writes back, so API responses are consistent without each
// module reinventing error/success shapes.
package response

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/devenock/vender/backend/internal/pkg/apperror"
)

type envelope struct {
	Data  any        `json:"data,omitempty"`
	Error *errorBody `json:"error,omitempty"`
}

type errorBody struct {
	Code    string            `json:"code"`
	Message string            `json:"message"`
	Fields  map[string]string `json:"fields,omitempty"`
}

// JSON writes data wrapped in the standard envelope with the given status.
func JSON(w http.ResponseWriter, status int, data any) {
	writeJSON(w, status, envelope{Data: data})
}

// NoContent writes a 204 with no body.
func NoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}

// Error maps err to an HTTP status and writes the standard error envelope.
// Errors that are not *apperror.Error are treated as internal and never
// have their message exposed to the client — only logged.
func Error(w http.ResponseWriter, logger *slog.Logger, err error) {
	status := apperror.HTTPStatus(err)

	body := &errorBody{Code: string(apperror.CodeInternal), Message: "internal error"}
	if appErr, ok := apperror.As(err); ok {
		body.Code = string(appErr.Code)
		body.Message = appErr.Message
		body.Fields = appErr.Fields
	}

	if status >= http.StatusInternalServerError && logger != nil {
		logger.Error("request failed", "error", err, "status", status)
	}

	writeJSON(w, status, envelope{Error: body})
}

func writeJSON(w http.ResponseWriter, status int, e envelope) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(e); err != nil {
		slog.Error("failed to encode response", "error", err)
	}
}
