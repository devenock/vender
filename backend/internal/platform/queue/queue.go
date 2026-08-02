// Package queue wraps asynq (Redis-backed background jobs — see
// docs/system-design.md §7). This package only builds the client/server;
// it registers no task handlers itself. Each module that needs
// background work (notification, payment, analytics, ...) registers its
// own handlers on the *asynq.ServeMux built in cmd/worker/main.go.
package queue

import (
	"github.com/hibiken/asynq"
)

// NewClient builds an asynq client for enqueueing tasks — used from
// cmd/api (and cmd/worker, for jobs that enqueue other jobs).
func NewClient(redisAddr, password string, db int) *asynq.Client {
	return asynq.NewClient(redisOpt(redisAddr, password, db))
}

// NewServer builds an asynq server for consuming tasks — used from
// cmd/worker only. concurrency is the number of tasks processed in
// parallel.
func NewServer(redisAddr, password string, db int, concurrency int) *asynq.Server {
	return asynq.NewServer(
		redisOpt(redisAddr, password, db),
		asynq.Config{Concurrency: concurrency},
	)
}

func redisOpt(addr, password string, db int) asynq.RedisClientOpt {
	return asynq.RedisClientOpt{Addr: addr, Password: password, DB: db}
}
