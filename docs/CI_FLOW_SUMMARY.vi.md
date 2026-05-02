# Tóm Tắt CI Trên Branch `feature/module2-ci`

Tài liệu này tóm tắt ngắn gọn phần CI đã được bổ sung trên branch `feature/module2-ci` để người khác có thể nắm nhanh luồng làm việc, phạm vi đã làm, và giới hạn hiện tại.

## Mục tiêu

- Chuẩn hóa kiểm tra frontend và backend bằng GitHub Actions
- Tự động build Docker image cho `frontend` và `backend`
- Thêm kiểm tra bảo mật bằng Trivy ở mức source và image
- Lưu artifact để phục vụ demo, báo cáo, và bước CD về sau
- Chuẩn bị contract đầu ra để phase sau có thể nối sang Docker Swarm mà không phải thiết kế lại

## File chính

- Mã nguồn ứng dụng hiện được gom trong `apps/`
  - `apps/frontend`
  - `apps/backend`
- Hạ tầng local hiện được gom trong `infra/`
  - `infra/compose/docker-compose.yml`
- Workflow điều phối: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- Workflow reusable:
  - [`.github/workflows/_frontend.yml`](../.github/workflows/_frontend.yml)
  - [`.github/workflows/_backend.yml`](../.github/workflows/_backend.yml)
  - [`.github/workflows/_security.yml`](../.github/workflows/_security.yml)
  - [`.github/workflows/_service-image.yml`](../.github/workflows/_service-image.yml)
  - [`.github/workflows/_delivery-contract.yml`](../.github/workflows/_delivery-contract.yml)
- Tài liệu chi tiết hơn:
  - [`docs/CI_EVIDENCE_MAP.md`](CI_EVIDENCE_MAP.md)
  - [`docs/CD_SWARM_CONTRACT.md`](CD_SWARM_CONTRACT.md)
  - [`docs/PHASE2_HANDOFF.md`](PHASE2_HANDOFF.md)

## Bối cảnh branch này

- Đây là branch tập trung vào **CI trước**, chưa phải branch triển khai production thật
- CI hiện là nguồn sự thật chính cho Phase 2
- Registry đang dùng là Docker Hub
- Hướng triển khai ở phase sau là **Tier 4 Docker Swarm**

## Khi nào CI chạy

- Khi mở hoặc cập nhật Pull Request vào `main`
- Khi `push` lên branch
- Khi `push` tag theo mẫu `v*`

## Luồng CI hiện tại

`ci.yml` giờ chỉ giữ trigger, policy, và DAG điều phối. Logic chi tiết đã được tách thành reusable workflows để dễ đọc và review hơn.

1. `prepare-context`
   - chạy đầu tiên để tính các giá trị dùng chung như `short_sha`, `branch_slug`, `publish_mode`, `release_tag_name`
   - tránh việc frontend, backend, image, và delivery-contract tự tính lại cùng một policy

2. `frontend-ci`
   - chạy `npm ci`
   - chạy lint
   - chạy test
   - chạy build production
   - upload artifact `frontend-build`
   - logic nằm trong `_frontend.yml`

3. `backend-ci`
   - cài dependencies Python
   - chạy `ruff`
   - chạy `pytest`
   - build Python wheel artifact cho backend
   - upload artifact `backend-build`
   - logic nằm trong `_backend.yml`

4. `security-scan`
   - quét repository bằng Trivy
   - kiểm tra lỗ hổng, secrets, và misconfiguration
   - upload artifact `trivy-fs-report`
   - chặn pipeline nếu còn lỗi `HIGH` hoặc `CRITICAL` sau khi áp dụng phần risk acceptance đã khai báo
   - logic nằm trong `_security.yml`

5. `frontend-image`
   - chỉ chạy sau khi `prepare-context`, `frontend-ci`, và `security-scan` đều đạt
   - build Docker image cho `frontend`
   - quét image bằng Trivy
   - sinh SBOM theo chuẩn CycloneDX
   - lưu metadata của image như Git SHA, ref, workflow run, immutable tag, branch tag, release tag
   - upload artifact `image-evidence-frontend`
   - logic dùng chung nằm trong `_service-image.yml`

6. `backend-image`
   - chỉ chạy sau khi `prepare-context`, `backend-ci`, và `security-scan` đều đạt
   - build Docker image cho `backend`
   - quét image bằng Trivy
   - sinh SBOM theo chuẩn CycloneDX
   - lưu metadata của image như Git SHA, ref, workflow run, immutable tag, branch tag, release tag
   - upload artifact `image-evidence-backend`
   - logic dùng chung nằm trong `_service-image.yml`

7. `delivery-contract`
   - chỉ chạy sau khi `frontend-image` và `backend-image` đều đạt
   - chỉ chạy khi `push` vào `main`
   - sinh artifact `swarm-delivery-contract`
   - artifact này gồm:
      - `release-manifest.json`
      - `swarm-deployment-inputs.env`
   - nhận image refs từ outputs của image jobs, không tự tính lại contract chính
   - mục đích là chuẩn bị dữ liệu đầu vào cho CD/Docker Swarm ở phase sau

## Quy tắc image tag và publish

- Tag deploy chính là `sha-<shortsha>`
- Tag `branch-*` chỉ để truy vết branch, không phải tag deploy chính
- Tag `v*` là tag release, không thay thế `sha-*`
- `latest` cố ý không được dùng làm contract deploy

## Khi nào image được push

- Pull Request vào `main`: chỉ validate, không đăng nhập Docker Hub, không push image
- Push lên branch thường: vẫn build và scan image trong CI, vẫn sinh artifact evidence, nhưng không push image
- Push lên `main`: đăng nhập Docker Hub và push đúng 2 tag mỗi image:
  - `sha-*`
  - `branch-main`
- Push tag `v*`: đăng nhập Docker Hub và push đúng 2 tag mỗi image:
  - `sha-*`
  - tag release tương ứng, ví dụ `v1.2.0`

## Artifact chính mà CI tạo ra

- `frontend-build`
  - output build production của frontend
- `backend-build`
  - Python wheel artifact của backend
- `trivy-fs-report`
  - báo cáo scan source code ở mức repository
- `image-evidence-frontend`
  - metadata JSON
  - Trivy image JSON report
  - CycloneDX SBOM
- `image-evidence-backend`
  - metadata JSON
  - Trivy image JSON report
  - CycloneDX SBOM
- `swarm-delivery-contract`
  - chỉ có ở `push` vào `main`
  - là contract đầu ra để phase sau CD có thể dùng lại

## Secret liên quan

- CI hiện tại cần:
  - `DOCKERHUB_USERNAME`
  - `DOCKERHUB_TOKEN`
- Secret cho Docker Swarm CD mới chỉ được reserve tên trong tài liệu, chưa dùng để deploy thật

## Kết quả branch này đã thêm

- Có pipeline CI rõ ràng cho cả frontend và backend
- Có kiểm tra bảo mật ở mức source và image
- Có build Docker image trong CI
- Có artifact để chứng minh kết quả build, scan, và provenance của image
- Có contract đầu ra để nối sang CD trong phase sau
- Có quy tắc tag rõ ràng để giữ traceability và tránh deploy bằng mutable tag

## Chưa làm trong branch này

- Chưa deploy thật lên server
- Chưa có job CD production chạy qua SSH
- Chưa có Swarm stack manifest hoặc cluster bootstrap thật
- Chưa cấu hình domain/HTTPS production
- Chưa triển khai monitoring runtime như Prometheus hoặc Grafana
