// Package validation gives every module's HTTP adapter a single way to
// validate inbound DTOs and turn failures into an *apperror.Error the
// standard response envelope already knows how to render.
package validation

import (
	"errors"

	"github.com/go-playground/validator/v10"

	"github.com/devenock/vender/backend/internal/pkg/apperror"
)

var validate = validator.New(validator.WithRequiredStructEnabled())

// Struct validates s using its `validate:"..."` struct tags. On failure it
// returns an *apperror.Error (Code=Invalid) with one Fields entry per
// failed field, suitable for passing straight to response.Error.
func Struct(s any) error {
	err := validate.Struct(s)
	if err == nil {
		return nil
	}

	var validationErrs validator.ValidationErrors
	if !errors.As(err, &validationErrs) {
		// Not a validation failure in the expected shape (e.g. bad usage
		// of the library) — surface as internal rather than pretending
		// it's a field error.
		return apperror.Internal(err)
	}

	fields := make(map[string]string, len(validationErrs))
	for _, fe := range validationErrs {
		fields[fe.Field()] = fe.Tag()
	}
	return apperror.NewInvalid(fields)
}
