// Package pagination provides the limit/offset convention shared by every
// module's list endpoints, so paging isn't reinvented per module.
package pagination

import (
	"net/http"
	"strconv"
)

const (
	DefaultLimit = 20
	MaxLimit     = 100
)

// Params is parsed from a request's ?limit=&offset= query params.
type Params struct {
	Limit  int
	Offset int
}

// FromRequest reads limit/offset from the query string, clamping limit to
// [1, MaxLimit] and offset to >= 0. Missing/invalid values fall back to
// sane defaults rather than erroring — pagination is not worth a 400.
func FromRequest(r *http.Request) Params {
	limit := DefaultLimit
	if v, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && v > 0 {
		limit = v
	}
	if limit > MaxLimit {
		limit = MaxLimit
	}

	offset := 0
	if v, err := strconv.Atoi(r.URL.Query().Get("offset")); err == nil && v >= 0 {
		offset = v
	}

	return Params{Limit: limit, Offset: offset}
}

// Meta describes a paginated result set for the response envelope.
type Meta struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
	Total  int `json:"total"`
}
