// Package cache wraps the Redis client used for read-through caching
// (see docs/system-design.md §5). Session storage and the job queue have
// their own packages (internal/platform/session, internal/platform/queue)
// even though they also live in Redis, since their access patterns and
// lifetimes are different from a general-purpose cache.
package cache

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

// NewClient builds a Redis client and verifies connectivity with a ping.
func NewClient(ctx context.Context, addr, password string, db int) (*redis.Client, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})
	if err := client.Ping(ctx).Err(); err != nil {
		_ = client.Close()
		return nil, fmt.Errorf("cache: ping: %w", err)
	}
	return client, nil
}
