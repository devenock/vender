// Package objectstorage wraps an S3-compatible object store (MinIO by
// default, self-hosted on the VPS — see docs/architecture.md §12) for
// product media and any other binary assets. Kept behind this small
// interface-shaped API so swapping MinIO for AWS S3/Cloudflare R2 later
// is a constructor change, not a rewrite of callers.
package objectstorage

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type Store struct {
	client *minio.Client
	bucket string
}

func New(endpoint, accessKey, secretKey, bucket string, useSSL bool) (*Store, error) {
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("objectstorage: create client: %w", err)
	}
	return &Store{client: client, bucket: bucket}, nil
}

// EnsureBucket creates the configured bucket if it doesn't already exist.
// Safe to call on every startup.
func (s *Store) EnsureBucket(ctx context.Context) error {
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return fmt.Errorf("objectstorage: check bucket: %w", err)
	}
	if exists {
		return nil
	}
	if err := s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{}); err != nil {
		return fmt.Errorf("objectstorage: create bucket: %w", err)
	}
	return nil
}

// Put uploads content under key, returning an error on failure. size may
// be -1 if unknown (streamed), at the cost of buffering.
func (s *Store) Put(ctx context.Context, key string, reader io.Reader, size int64, contentType string) error {
	_, err := s.client.PutObject(ctx, s.bucket, key, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return fmt.Errorf("objectstorage: put %s: %w", key, err)
	}
	return nil
}

// Delete removes the object at key.
func (s *Store) Delete(ctx context.Context, key string) error {
	if err := s.client.RemoveObject(ctx, s.bucket, key, minio.RemoveObjectOptions{}); err != nil {
		return fmt.Errorf("objectstorage: delete %s: %w", key, err)
	}
	return nil
}

// PresignedGetURL returns a time-limited, unauthenticated URL for
// reading the object at key — used to serve product images without
// proxying bytes through the API process.
func (s *Store) PresignedGetURL(ctx context.Context, key string, expiry time.Duration) (string, error) {
	u, err := s.client.PresignedGetObject(ctx, s.bucket, key, expiry, nil)
	if err != nil {
		return "", fmt.Errorf("objectstorage: presign %s: %w", key, err)
	}
	return u.String(), nil
}
